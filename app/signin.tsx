import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, TextInput, View } from "react-native";
import styled from "styled-components/native";

import CircleButton from "@/entities/common/components/button_circle";
import { ColContainer } from "@/entities/common/components/containers";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode, refreshCode } from "@/entities/common/util/storage";
import { Colors, FontSizes } from "@/entities/common/util/style_var";
import InputContainer from "@/entities/signup/input_container";

const handleSignin = (email: string, password: string, onSuccess: () => void) => {
  fetchInstance()
    .post("/api/auth/login", {
      email: email.trim() + "@kangwon.ac.kr",
      password: password.trim(),
    })
    .then((res) => {
      if (!res.data.token || !res.data.refreshToken) return;
      authCode.set(res.data.token);
      refreshCode.set(res.data.refreshToken);
      onSuccess();
    })
    .catch((err) => {
      console.error("❌ 로그인 실패:", err.response?.data || err.message);
      Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    });
};

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  return (
    <Background source={{ uri: "여기에 경로 지정" }} resizeMode="cover">
      <Container>
        <NoticeText>
          {`강원대학교 학생을 위한 카풀 서비스,
--- 입니다.`}
        </NoticeText>
        <ColContainer alignItems="center" gap={15}>
          <InputContainer title="강원대 메일">
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" />
            <MailText>@kangwon.ac.kr</MailText>
          </InputContainer>
          <InputContainer title="비밀번호">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="비밀번호를 입력하세요"
            />
          </InputContainer>
          <ToSignup href="/signup">회원가입</ToSignup>
        </ColContainer>
        <CircleButton
          icon="checkmark"
          onPress={() => handleSignin(email, password, () => router.push("/"))}
        />
      </Container>
    </Background>
  );
}

const Background = styled(ImageBackground)({
  flex: 1,
  justifyContent: "center", // 세로 중앙 정렬
  alignItems: "center", // 가로 중앙 정렬
});

const Container = styled.View({
  width: "100%",
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
  gap: 30,
});

const Input = styled.TextInput({
  fontSize: FontSizes.medium,
  maxWidth: "6rem",
  border: "none",
  textAlign: "right",
  flexGrow: 1,
});

const NoticeText = styled.Text({
  padding: 20,
  fontSize: FontSizes.medium,
  textAlign: "center",
  width: "100%",
});

const MailText = styled.Text({
  color: Colors.main,
  fontSize: FontSizes.medium,
});

const ToSignup = styled(Link)({
  color: Colors.side,
  fontSize: FontSizes.small,
  textDecorationLine: "underline",
  alignSelf: "flex-end",
});
