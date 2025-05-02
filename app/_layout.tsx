import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";

import LoadingScreen from "../entities/loadingpage/loadingpage";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000); // 5초
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "회원가입" }} />
    </Stack>
  );
}
