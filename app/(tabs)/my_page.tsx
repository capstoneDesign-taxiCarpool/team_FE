import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";

import { authCode as authCodeStorage } from "@/entities/common/util/storage";

import defaultProfile from "../../assets/images/default-profile.png"; // 기본 프로필 아이콘

export default function MyPage() {
  const router = useRouter();
  const [authCode, setAuthCode] = useState<string>("");

  useEffect(() => {
    authCodeStorage.get().then((code) => setAuthCode(code ?? ""));
  }, []);

  const isLoggedIn = !!authCode;

  return (
    <Container>
      <ProfileImage source={defaultProfile} />

      {isLoggedIn ? (
        <>
          <TextBox>어서오세요, {authCode} 님</TextBox>
          {/* 로그인 상태일 때 다른 내용 추가 가능 */}
        </>
      ) : (
        <>
          <LoginGuideButton onPress={() => router.push("/login")}>
            <LoginGuideText>로그인 후 이용해주세요 &gt;</LoginGuideText>
          </LoginGuideButton>
        </>
      )}
    </Container>
  );
}

// ✅ 스타일

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const ProfileImage = styled(Image)`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-bottom: 20px;
`;

const LoginGuideButton = styled(TouchableOpacity)`
  background-color: #4a90e2;
  padding: 12px 24px;
  border-radius: 25px;
`;

const LoginGuideText = styled(Text)`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const TextBox = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;
