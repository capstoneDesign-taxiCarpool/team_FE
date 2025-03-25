import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { authCode as authCodeStorage } from "@/entities/common/util/storage";

export default function MyPage() {
  const [authCode, setAuthCode] = useState<string>("");
  useEffect(() => {
    authCodeStorage.get().then((code) => setAuthCode(code ?? "로그인 안됨"));
  }, []);

  return (
    <View>
      <Text>{authCode}</Text>
      <Link href="/signup">회원가입</Link>
    </View>
  );
}
