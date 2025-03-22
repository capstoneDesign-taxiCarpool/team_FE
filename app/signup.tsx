import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import Button from "@/entities/common/components/button";

export default function Signup() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>회원가입 페이지</Text>
      <Button title="뒤로 가기" icon="house.fill" onPress={() => router.back()} />
    </View>
  );
}
