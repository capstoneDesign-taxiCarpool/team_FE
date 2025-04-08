import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "회원가입", headerShown: false }} />
      <Stack.Screen name="carpool/join" options={{ title: "카풀 참여하기" }} />
    </Stack>
  );
}
