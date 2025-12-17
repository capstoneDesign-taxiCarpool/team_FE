import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode, refreshCode } from "@/entities/common/util/storage";
import PersonalInfo from "@/entities/signup/personal_info";
import VertifyEmail from "@/entities/signup/vertify_email";

const handleSignup = (
  email: string,
  password: string,
  passwordConfirm: string,
  nickname: string,
  sex: number,
  onSuccess: () => void,
) => {
  if (password !== passwordConfirm) {
    Alert.alert("회원가입 실패", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  fetchInstance()
    .post("/api/auth/signup", {
      email: email.trim() + "@kangwon.ac.kr",
      password,
      nickname,
      gender: sex,
    })
    .then(() => {
      fetchInstance()
        .post("/api/auth/login", {
          email: email.trim() + "@kangwon.ac.kr",
          password,
        })
        .then((res) => {
          authCode.set(res.data.token);
          refreshCode.set(res.data.refreshToken);
          Alert.alert("회원가입 성공");
          onSuccess();
        });
    })
    .catch((err) => {
      if (err.response.status === 404) Alert.alert("회원가입 실패", "이메일 인증을 먼저 해주세요.");
      else
        Alert.alert(
          "회원가입 실패",
          Object.values(err.response.data.errors).join("\n") ?? "서버 오류",
        );
    });
};

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [sex, setSex] = useState<number>(0);
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "position"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Container>
          <SignupContainer>
            <NoticeText>
              <BoldText>
                강원대학교 학생만을 위한{"\n"}
                택시 카풀 서비스,{"\n"}
              </BoldText>
              강택에서 회원가입을 진행하세요.
            </NoticeText>

            {/* 이메일 인증 컴포넌트 */}
            <InputWrapper>
              <VertifyEmail email={email} setEmail={setEmail} />
            </InputWrapper>

            {/* 개인정보 입력 컴포넌트 */}
            <InputWrapper>
              <PersonalInfo
                password={password}
                setPassword={setPassword}
                sex={sex}
                setSex={setSex}
                nickname={nickname}
                setNickname={setNickname}
                passwordConfirm={passwordConfirm}
                setPasswordConfirm={setPasswordConfirm}
              />
            </InputWrapper>

            {/* 회원가입 버튼 */}
            <LoginButton
              onPress={() =>
                handleSignup(email, password, passwordConfirm, nickname, sex, () =>
                  router.push("/"),
                )
              }
            >
              <LoginButtonText>회원가입</LoginButtonText>
            </LoginButton>

            {/* 로그인 이동 버튼 */}
            <SignupButton onPress={() => router.push("/signin")}>
              <SignupButtonText>로그인으로 돌아가기</SignupButtonText>
            </SignupButton>
          </SignupContainer>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Container = styled.View({
  width: "100%",
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 40,
});

const SignupContainer = styled.View({
  width: "90%",
  backgroundColor: "rgb(148, 200, 230)",
  borderRadius: 16,
  paddingVertical: 30,
  paddingHorizontal: 25,
  marginTop: 30,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 6,

  alignItems: "center",
  gap: 24,
});

const NoticeText = styled.Text({
  fontSize: 18,
  textAlign: "left",
  fontWeight: "600",
  color: "black",
  width: "100%",
  lineHeight: 26,
  marginLeft: "20%",
});

const BoldText = styled.Text({
  fontWeight: "700",
  color: "#333",
});

const InputWrapper = styled.View({
  width: "100%",
  gap: 18,
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
