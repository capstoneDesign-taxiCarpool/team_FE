import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import Button from "@/entities/common/components/button";
import CircleButton from "@/entities/common/components/button_circle";
import Label from "@/entities/common/components/label";

export default function Signup() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>회원가입 페이지</Text>
      <Label title="회원가입" />
      <Button title="뒤로 가기" icon="house.fill" onPress={() => router.back()} />
      <CircleButton icon="house.fill" onPress={() => router.push("/signup")} />
    </View>
  );
}
