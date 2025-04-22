import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { authCode as authCodeStorage } from "@/entities/common/util/storage";

export default function MyPage() {
  const [authCode, setAuthCode] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    authCodeStorage.get().then((code) => setAuthCode(code ?? "로그인 안됨"));
  }, []);

  return (
    <View>
      <Text>{authCode}</Text>
      <Link href="/signup">회원가입</Link>
      <Text onPress={() => router.push("/carpool/recruit")}>테스트 버튼</Text>
    </View>
  );
}
