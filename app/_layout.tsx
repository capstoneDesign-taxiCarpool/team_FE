import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, StackScreenProps } from "expo-router";
import React, { useEffect, useState } from "react";

const queryClient = new QueryClient();

type ChatPageParams = {
  startPlace?: string;
  endPlace?: string;
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const app = getApp();
  const analytics = getAnalytics(app);

  // 페이지 방문 시 애널리틱스 기록
  useEffect(() => {
    logScreenView(analytics, {
      screen_name: "RootLayout",
      screen_class: "RootLayout",
      params: {},
    });
  }, [analytics]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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
              title: `${start} → ${end}`,
              headerTintColor: "#000000",
              headerStyle: { backgroundColor: "#f2f2f2" },
              headerTitleAlign: "left",
              headerTitleStyle: { fontSize: 15 },
              contentStyle: { backgroundColor: "#fff" },
            };
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
