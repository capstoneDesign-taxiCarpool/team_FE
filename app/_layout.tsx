import messaging, { RemoteMessage } from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, StackScreenProps, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { InteractionManager, PermissionsAndroid, Platform } from "react-native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { authCode } from "@/entities/common/util/storage";

/* ================= React Query ================= */

const queryClient = new QueryClient();

/* ================= Types ================= */

type ChatPageParams = {
  roomId?: string;
  startPlace?: string;
  endPlace?: string;
};

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

/* ================= FCM Token Register ================= */

async function registerFcmToken(token: string) {
  try {
    const deviceId = await getDeviceIdOrGenerate();

    const body = {
      fcmToken: token,
      platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
      deviceId,
      appVersion: "1.0.0",
      bundleOrPackage: "com.myapp",
    };

    const auth = await authCode.get();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth) headers["Authorization"] = `Bearer ${auth}`;

    await fetch("https://knu-carpool.store/api/fcm/token", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    // ignore
  }
}

/* ================= 알림 데이터 → Store 저장만 ================= */

function handleNotificationData(data: NotificationData | null | undefined) {
  if (data?.type === "CHAT_MESSAGE" && data.partyId !== undefined) {
    usePartyStore.getState().setPendingChatRoomId(Number(data.partyId));
  }
}

/* ================= FCM 초기화 ================= */

async function initializeFCM() {
  /* 권한 */
  if (Platform.OS === "ios") {
    await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
    });
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  /* Android 채널 */
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fcm_default_channel", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  /* 토큰 */
  const token = await messaging().getToken();
  if (token) await registerFcmToken(token);

  const unsubToken = messaging().onTokenRefresh(registerFcmToken);

  /* 포그라운드 수신 */
  const unsubMessage = messaging().onMessage(async (msg) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.notification?.title ?? "새 알림",
        body: msg.notification?.body ?? "",
        data: msg.data,
      },
      trigger: null,
    });
  });

  /* 백그라운드 클릭 */
  const unsubOpened = messaging().onNotificationOpenedApp((msg: RemoteMessage | null) => {
    handleNotificationData(msg?.data as NotificationData);
  });

  /* 종료 상태 클릭 */
  messaging()
    .getInitialNotification()
    .then((msg) => {
      handleNotificationData(msg?.data as NotificationData);
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

    initializeFCM().then((c) => {
      cleanup = c;
    });

    return () => cleanup?.();
  }, []);

  /* Expo 알림 클릭 (포그라운드 iOS) */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      handleNotificationData(res.notification.request.content.data as NotificationData);
    });

    return () => sub.remove();
  }, []);

  /* ✅ Router 준비 후 실제 이동 */
  useEffect(() => {
    if (!pendingChatRoomId) return;

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
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#fff" },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "회원가입" }} />
        <Stack.Screen name="signin" options={{ title: "로그인" }} />
        <Stack.Screen name="carpool/join" options={{ title: "카풀 참여하기" }} />
        <Stack.Screen name="carpool/edit" options={{ title: "카풀 설정 변경하기" }} />
        <Stack.Screen name="carpool/recruit" options={{ title: "카풀 모집하기" }} />
        <Stack.Screen name="carpool/recheck" options={{ title: "설정확인" }} />
        <Stack.Screen name="carpool/find_track" options={{ title: "경로 설정" }} />
        <Stack.Screen
          name="chatpage"
          options={({
            route,
          }: StackScreenProps<{
            chatpage: ChatPageParams;
          }>["route"]) => ({
            title: route?.params?.roomId ? `채팅방 ${route.params.roomId}` : "채팅",
          })}
        />
      </Stack>
    </QueryClientProvider>
  );
}
