import messaging, { RemoteMessage } from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 💡 Expo Notifications 임포트
import * as Notifications from "expo-notifications";
import { Stack, StackScreenProps, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { authCode } from "@/entities/common/util/storage";

const queryClient = new QueryClient();

type ChatPageParams = { roomId?: string; startPlace?: string; endPlace?: string };

const DEVICE_ID_KEY = "my_app_device_id_v1";

async function getDeviceIdOrGenerate() {
  const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (stored) return stored;
  const newId = `generated-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  return newId;
}

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
    console.log("✅ FCM 토큰 서버 등록 성공");
  } catch (e) {
    console.log("❌ FCM 토큰 등록 실패", e);
  }
}

// 💡 setPartyStore에 대한 정확한 타입 정의
type SetPartyStoreFn = (state: { partyId: number | null }) => void;

// FCM 초기화 및 리스너 등록 함수
const initializeFCM = async (
  router: ReturnType<typeof useRouter>,
  setPartyStore: SetPartyStoreFn, // 💡 any 타입 제거
) => {
  // 1. 권한 요청
  if (Platform.OS === "ios") {
    await messaging().requestPermission({ alert: true, sound: true, badge: true });
  }
  if (Platform.OS === "android" && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  // 2. Android 채널 생성 (중복 진동/소리 방지를 위해 null 설정)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fcm_default_channel", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.MAX,
      // 🟢 수정: 진동 및 소리 비활성화 (OS 기본 알림만 사용)
      vibrationPattern: null,
      sound: null,
    });
  }

  // 3. 토큰 획득 및 서버 등록
  const token = await messaging().getToken();
  if (token) {
    console.log("FCM Token:", token);
    await registerFcmToken(token);
  }

  // 4. 토큰 갱신 리스너 등록
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(registerFcmToken);

  // 5. 포그라운드 메시지 리스너 등록 (Expo Notifications로 직접 띄우며 진동/소리 제거)
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log("FCM 포그라운드 메시지 수신", remoteMessage);

    const title = remoteMessage.notification?.title || remoteMessage.data?.title || "새 알림";
    const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

    // Expo Notifications로 알림 직접 표시: 진동/소리 비활성화
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: remoteMessage.data,
        sound: false,
        vibration: false,
        channelId: "fcm_default_channel",
      },
      trigger: {
        seconds: 1,
      },
    });
  });

  // 6. 백그라운드/종료 상태 알림 클릭 처리 (딥링크)
  const handleNotificationClick = (remoteMessage: RemoteMessage | null) => {
    // 💡 any 타입 제거
    const data = remoteMessage?.data;
    if (data?.type === "CHAT_MESSAGE" && data?.partyId) {
      setPartyStore({ partyId: Number(data.partyId) });
      router.push({ pathname: "/chatpage", params: { roomId: data.partyId } });
    }
  };

  const unsubscribeOpened = messaging().onNotificationOpenedApp(handleNotificationClick);

  // 7. 종료 상태 클릭 처리
  messaging().getInitialNotification().then(handleNotificationClick);

  // 8. 클린업 함수 반환
  return () => {
    unsubscribeTokenRefresh();
    unsubscribeOnMessage();
    unsubscribeOpened();
  };
};

// 💡 포그라운드에서 알림 배너가 보이도록 설정 (소리/진동은 false로 유지)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const setPartyStore = usePartyStore((state) => state.setPartyState);

  // FCM 초기화
  useEffect(() => {
    let cleanup: () => void;
    initializeFCM(router, setPartyStore).then((c) => {
      cleanup = c;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [router, setPartyStore]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: "#fff" } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "회원가입" }} />
        <Stack.Screen name="signin" options={{ title: "로그인" }} />
        <Stack.Screen name="carpool/join" options={{ headerShown: false }} />
        <Stack.Screen name="carpool/edit" options={{ headerShown: false }} />
        <Stack.Screen name="carpool/recruit" options={{ headerShown: false }} />
        <Stack.Screen name="carpool/recheck" options={{ headerShown: false }} />
        <Stack.Screen name="carpool/find_track" options={{ headerShown: false }} />
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
