import messaging, { RemoteMessage } from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, StackScreenProps, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { InteractionManager, PermissionsAndroid, Platform } from "react-native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { authCode } from "@/entities/common/util/storage";

const queryClient = new QueryClient();

type ChatPageParams = { roomId?: string; startPlace?: string; endPlace?: string };

const DEVICE_ID_KEY = "my_app_device_id_v1";

/* ================= Device ID ================= */

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
    const headers: Record<string, string> = { "Content-Type": "application/json" };
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

/* ================= 알림 데이터 타입 ================= */

type NotificationData = {
  type?: string;
  partyId?: string | number;
};

/* ================= 공통 알림 클릭 처리 ================= */

const navigateFromNotification = (
  remoteData: NotificationData | null | undefined,
  router: ReturnType<typeof useRouter>,
  setPartyStore: (state: { partyId: number | null }) => void,
) => {
  if (remoteData?.type === "CHAT_MESSAGE" && remoteData.partyId !== undefined) {
    const partyId = Number(remoteData.partyId);

    setPartyStore({ partyId });

    InteractionManager.runAfterInteractions(() => {
      router.push({
        pathname: "/chatpage",
        params: { roomId: partyId },
      });
    });
  }
};

/* ================= FCM 초기화 ================= */

const initializeFCM = async (
  router: ReturnType<typeof useRouter>,
  setPartyStore: (state: { partyId: number | null }) => void,
) => {
  /* 1️⃣ 권한 요청 */
  if (Platform.OS === "ios") {
    await messaging().requestPermission({ alert: true, sound: true, badge: true });
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  /* 2️⃣ Android 채널 */
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fcm_default_channel", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: null,
      sound: null,
    });
  }

  /* 3️⃣ 토큰 등록 */
  const token = await messaging().getToken();
  if (token) await registerFcmToken(token);

  /* 4️⃣ 토큰 갱신 */
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(registerFcmToken);

  /* 5️⃣ 포그라운드 수신 */
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage.notification?.title || remoteMessage.data?.title || "새 알림";

    const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: remoteMessage.data,
        sound: false,
        vibration: false,
        channelId: "fcm_default_channel",
      },
      trigger: { seconds: 1 },
    });
  });

  /* 6️⃣ 백그라운드 클릭 */
  const unsubscribeOpened = messaging().onNotificationOpenedApp(
    (remoteMessage: RemoteMessage | null) => {
      navigateFromNotification(remoteMessage?.data as NotificationData, router, setPartyStore);
    },
  );

  /* 7️⃣ 종료 상태 클릭 */
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      navigateFromNotification(remoteMessage?.data as NotificationData, router, setPartyStore);
    });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeOnMessage();
    unsubscribeOpened();
  };
};

/* ================= Expo 알림 설정 ================= */

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
  const setPartyStore = usePartyStore((state) => state.setPartyState);

  /* FCM 초기화 */
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    initializeFCM(router, setPartyStore).then((c) => {
      cleanup = c;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [router, setPartyStore]);

  /* Expo 알림 클릭 (포그라운드 iOS 필수) */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData | undefined;

      navigateFromNotification(data, router, setPartyStore);
    });

    return () => sub.remove();
  }, [router, setPartyStore]);

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
        <Stack.Screen name="reset_password" options={{ title: "비밀번호 재설정" }} />
        <Stack.Screen name="carpool/join" options={{ title: "카풀 참여하기" }} />
        <Stack.Screen name="carpool/edit" options={{ title: "카풀 설정 변경하기" }} />
        <Stack.Screen name="carpool/recruit" options={{ title: "카풀 모집하기" }} />
        <Stack.Screen name="carpool/recheck" options={{ title: "설정확인" }} />
        <Stack.Screen name="carpool/find_track" options={{ title: "경로 설정" }} />
        <Stack.Screen
          name="chatpage"
          options={({ route }: StackScreenProps<{ chatpage: ChatPageParams }>["route"]) => {
            const start = route?.params?.startPlace || "출발지";
            const end = route?.params?.endPlace || "목적지";

            return {
              title: route?.params?.roomId ? `채팅방 ${route.params.roomId}` : `${start} → ${end}`,
              headerTintColor: "#000",
              headerStyle: { backgroundColor: "#f2f2f2" },
              headerTitleAlign: "left",
              headerTitleStyle: { fontSize: 15 },
            };
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
