import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, ImageBackground, Keyboard, Pressable, TextInput } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode, refreshCode } from "@/entities/common/util/storage";

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
    .catch(() => {
      Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    });
};

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  // ✅ Next 누르면 비밀번호로 포커스 이동
  const passwordRef = useRef<TextInput>(null);

  return (
    <Background source={{ uri: "여기에 경로 지정" }} resizeMode="cover">
      <Pressable style={{ flex: 1, width: "100%" }} onPress={Keyboard.dismiss}>
        <Container>
          <LoginContainer>
            <NoticeText>
              <BoldText>
                강원대학교 학생만을 위한{"\n"}
                택시 카풀 서비스,{"\n"}
              </BoldText>
              강택을 만나보세요.
            </NoticeText>

            <InputsWrapper>
              <InputBox>
                <Label>강원대 메일</Label>
                <StyledInputRow>
                  <StyledInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      // ✅ "다음"을 누르면 키보드를 내리는 게 아니라 비밀번호로 이동
                      passwordRef.current?.focus();
                    }}
                    onPressIn={(e) => e.stopPropagation?.()}
                  />
                  <MailText>@kangwon.ac.kr</MailText>
                </StyledInputRow>
              </InputBox>

              <InputBox>
                <Label>비밀번호</Label>
                <StyledInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#888"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                  onPressIn={(e) => e.stopPropagation?.()}
                />
              </InputBox>
            </InputsWrapper>

            <ForgotPasswordButton
              onPress={(e) => {
                // @ts-ignore
                e?.stopPropagation?.();
                Keyboard.dismiss();
                router.push("/reset_password");
              }}
            >
              <ForgotPasswordText>비밀번호를 잊으셨나요?</ForgotPasswordText>
            </ForgotPasswordButton>

            <LoginButton
              onPress={(e) => {
                // @ts-ignore
                e?.stopPropagation?.();
                Keyboard.dismiss();
                handleSignin(email, password, () => router.push("/"));
              }}
            >
              <LoginButtonText>로그인</LoginButtonText>
            </LoginButton>

            <SignupButton
              onPress={(e) => {
                // @ts-ignore
                e?.stopPropagation?.();
                Keyboard.dismiss();
                router.push("/signup");
              }}
            >
              <SignupButtonText>회원가입</SignupButtonText>
            </SignupButton>
          </LoginContainer>
        </Container>
      </Pressable>
    </Background>
  );
}

const Background = styled(ImageBackground)({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const BoldText = styled.Text({
  fontWeight: "700",
  color: "#333",
});

const Container = styled.View({
  width: "100%",
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
});

const LoginContainer = styled.View({
  width: "90%",
  backgroundColor: "rgb(148, 200, 230)",
  borderRadius: 16,
  paddingVertical: 30,
  paddingHorizontal: 25,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 6,

  alignItems: "center",
  gap: 20,
});

const NoticeText = styled.Text({
  fontSize: 18,
  textAlign: "left",
  fontWeight: "600",
  color: "black",
  width: "100%",
  lineHeight: 26,
  marginLeft: "35%",
});

const InputsWrapper = styled.View({
  width: "100%",
  gap: 18,
});

const InputBox = styled.View({
  width: "100%",
  minHeight: 75,
  backgroundColor: "#f5f5f5",
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
});

const Label = styled.Text({
  fontSize: 14,
  fontWeight: "600",
  color: "black",
  marginBottom: 6,
});

const StyledInputRow = styled.View({
  flexDirection: "row",
  alignItems: "center",
});

const StyledInput = styled.TextInput({
  flex: 1,
  fontSize: 14,
  paddingVertical: 6,
  color: "black",
});

const MailText = styled.Text({
  fontSize: 14,
  color: "black",
  marginLeft: 4,
});

const LoginButton = styled.TouchableOpacity({
  width: "100%",
  height: 48,
  backgroundColor: "#4A90E2",
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
});

const LoginButtonText = styled.Text({
  color: "#333",
  fontSize: 16,
  fontWeight: "600",
});

const SignupButton = styled.TouchableOpacity({
  width: "100%",
  height: 48,
  backgroundColor: "#4A90E2",
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
});

const SignupButtonText = styled.Text({
  color: "#333",
  fontSize: 16,
  fontWeight: "600",
});

const ForgotPasswordButton = styled.TouchableOpacity({
  alignSelf: "flex-end",
  marginTop: -10,
  marginBottom: 10,
});

const ForgotPasswordText = styled.Text({
  color: "#333",
  fontSize: 14,
  textDecorationLine: "underline",
});
