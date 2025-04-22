import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "회원가입" }} />
        <Stack.Screen name="carpool/join" options={{ title: "카풀 참여하기" }} />
        <Stack.Screen name="carpool/recruit" options={{ title: "카풀 모집하기" }} />
        <Stack.Screen name="carpool/find_track" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
