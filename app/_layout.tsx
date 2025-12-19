import messaging, { RemoteMessage } from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { InteractionManager, PermissionsAndroid, Platform } from "react-native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { authCode } from "@/entities/common/util/storage";

/* ================= React Query ================= */

const queryClient = new QueryClient();

/* ================= Types ================= */

type NotificationData = {
  type?: string;
  partyId?: string | number;
};

/* ================= Device ID ================= */

const DEVICE_ID_KEY = "my_app_device_id_v1";

async function getDeviceIdOrGenerate() {
  const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (stored) return stored;

  const newId = `generated-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  return newId;
}

/* ================= Utils ================= */

/** FCM RemoteMessage 파서 (Android + iOS APNS flatten 대응) */
function extractFromRemoteMessage(msg: RemoteMessage | null): NotificationData | null {
  if (!msg) return null;

  // Android / 정상 FCM
  if (msg.data?.partyId) {
    return {
      type: msg.data.type,
      partyId: msg.data.partyId,
    };
  }

  // iOS APNS flatten 대응
  const flattened = msg as unknown as {
    partyId?: string | number;
    type?: string;
  };

  if (flattened.partyId) {
    return {
      type: flattened.type,
      partyId: flattened.partyId,
    };
  }

  return null;
}

/** Expo foreground notification click 파서 */
function extractFromExpoResponse(res: Notifications.NotificationResponse): NotificationData | null {
  const data = res.notification.request.content.data;
  if (!data) return null;

  return {
    type: (data as NotificationData).type,
    partyId: (data as NotificationData).partyId,
  };
}

/* ================= FCM Token Register ================= */

async function registerFcmToken(token: string) {
  try {
    const deviceId = await getDeviceIdOrGenerate();
    const auth = await authCode.get();

    console.log("[FCM] register token:", token);

    await fetch("https://knu-carpool.store/api/fcm/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify({
        fcmToken: token,
        platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
        deviceId,
        appVersion: "1.0.0",
        bundleOrPackage: "com.myapp",
      }),
    });
  } catch (e) {
    console.log("[FCM] token register error", e);
  }
}

/* ================= 알림 데이터 처리 ================= */

function handleNotificationData(data: NotificationData | null, source: string) {
  console.log(`[FCM][${source}] parsed data =`, data);

  if (data?.type === "CHAT_MESSAGE" && data.partyId !== undefined) {
    const roomId = Number(data.partyId);
    console.log(`[FCM][${source}] setPendingChatRoomId →`, roomId);
    usePartyStore.getState().setPendingChatRoomId(roomId);
  }
}

/* ================= FCM 초기화 ================= */

async function initializeFCM() {
  if (Platform.OS === "ios") {
    await messaging().requestPermission();
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fcm_default_channel", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const token = await messaging().getToken();
  if (token) await registerFcmToken(token);

  const unsubToken = messaging().onTokenRefresh(registerFcmToken);

  /* 🔥 포그라운드 수신 */
  const unsubMessage = messaging().onMessage(async (msg) => {
    console.log("[FCM][onMessage] received", msg.data);

    const data = extractFromRemoteMessage(msg);
    const incomingRoomId = data?.partyId !== undefined ? Number(data.partyId) : null;

    const { currentChatRoomId } = usePartyStore.getState();

    // 채팅방 내부면 알림 차단
    if (
      data?.type === "CHAT_MESSAGE" &&
      currentChatRoomId !== null &&
      incomingRoomId === currentChatRoomId
    ) {
      console.log("[FCM][onMessage] suppressed (already in chat)");
      return;
    }

    // iOS 포그라운드에서는 로컬 알림 생성 안 함
    if (Platform.OS === "ios") {
      console.log("[FCM][onMessage] ios foreground - skip");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.notification?.title ?? "새 알림",
        body: msg.notification?.body ?? "",
        data: msg.data,
      },
      trigger: null,
    });
  });

  /* 📲 백그라운드 클릭 */
  const unsubOpened = messaging().onNotificationOpenedApp((msg: RemoteMessage | null) => {
    console.log("[FCM][onNotificationOpenedApp]");
    const data = extractFromRemoteMessage(msg);
    handleNotificationData(data, "background");
  });

  /* 🧊 종료 상태 클릭 */
  messaging()
    .getInitialNotification()
    .then((msg) => {
      if (!msg) return;
      console.log("[FCM][getInitialNotification]");
      const data = extractFromRemoteMessage(msg);
      handleNotificationData(data, "quit");
    });

  return () => {
    unsubToken();
    unsubMessage();
    unsubOpened();
  };
}

/* ================= Expo Notification Handler ================= */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/* ================= Root Layout ================= */

export default function RootLayout() {
  const router = useRouter();

  const pendingChatRoomId = usePartyStore((state) => state.pendingChatRoomId);
  const clearPendingChatRoomId = usePartyStore((state) => state.clearPendingChatRoomId);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  /* FCM 초기화 */
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializeFCM().then((c) => (cleanup = c));
    return () => cleanup?.();
  }, []);

  /* iOS 포그라운드 알림 클릭 */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      console.log("[Expo][notification click]");
      const data = extractFromExpoResponse(res);
      handleNotificationData(data, "expo-foreground");
    });

    return () => sub.remove();
  }, []);

  /* 🚀 실제 라우팅 */
  useEffect(() => {
    if (!pendingChatRoomId) return;

    console.log("[ROUTER] navigate to chatpage:", pendingChatRoomId);

    InteractionManager.runAfterInteractions(() => {
      setPartyState({ partyId: pendingChatRoomId });

      router.push({
        pathname: "/chatpage",
        params: { roomId: pendingChatRoomId },
      });

      clearPendingChatRoomId();
    });
  }, [pendingChatRoomId, router, clearPendingChatRoomId, setPartyState]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chatpage" />
      </Stack>
    </QueryClientProvider>
  );
}
