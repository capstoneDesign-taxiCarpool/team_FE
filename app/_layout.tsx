import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";

import LoadingScreen from "./loadingpage";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const app = getApp();
  const analytics = getAnalytics(app);

  // 페이지 방문 시 애널리틱스에 기록
  useEffect(() => {
    logScreenView(analytics, {
      screen_name: pathname,
      screen_class: pathname,
      params: params,
    });
  }, [pathname, params, analytics]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000); // 5초
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
      </Stack>
    </QueryClientProvider>
  );
}
