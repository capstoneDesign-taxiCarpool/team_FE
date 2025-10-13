import notifee, { AndroidImportance } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, StackScreenProps, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";

const queryClient = new QueryClient();

type ChatPageParams = { roomId?: string; startPlace?: string; endPlace?: string };

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const setPartyStore = usePartyStore((state) => state.setPartyState);

  // 스플래시
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // FCM 초기화
  useEffect(() => {
    const initFCM = async () => {
      if (Platform.OS === "ios") {
        await messaging().requestPermission({ alert: true, sound: true, badge: true });
      }
      if (Platform.OS === "android" && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      if (Platform.OS === "android") {
        await notifee.createChannel({
          id: "fcm_default_channel",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: "default",
        });
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      messaging().onTokenRefresh((newToken) => {
        console.log("FCM Token refreshed:", newToken);
        // 서버 등록 로직 가능
      });
    };

    initFCM();

    // 포그라운드 메시지
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      if (!remoteMessage.notification) return;
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId: "fcm_default_channel",
          importance: AndroidImportance.HIGH,
          smallIcon: "ic_launcher",
          autoCancel: true,
          pressAction: { id: "default" },
        },
        ios: { sound: "default" },
      });
    });

    // 백그라운드 클릭
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      const data = remoteMessage?.data;
      if (data?.type === "CHAT_MESSAGE" && data?.partyId) {
        setPartyStore({ partyId: Number(data.partyId) });
        router.push({ pathname: "/chatpage", params: { roomId: data.partyId } });
      }
    });

    // 종료 상태 클릭
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        const data = remoteMessage?.data;
        if (data?.type === "CHAT_MESSAGE" && data?.partyId) {
          setPartyStore({ partyId: Number(data.partyId) });
          router.push({ pathname: "/chatpage", params: { roomId: data.partyId } });
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOpened();
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
