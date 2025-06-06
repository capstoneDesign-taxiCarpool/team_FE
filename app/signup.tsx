import { getCrashlytics, recordError } from "@react-native-firebase/crashlytics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, View } from "react-native";
import styled from "styled-components/native";

import CircleButton from "@/entities/common/components/button_circle";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode, refreshCode } from "@/entities/common/util/storage";
import { FontSizes } from "@/entities/common/util/style_var";
import PersonalInfo from "@/entities/signup/personal_info";
import VertifyEmail from "@/entities/signup/vertify_email";

const handleSignup = (
  email: string,
  password: string,
  nickname: string,
  sex: number,
  onSuccess: () => void,
  crashlytics: ReturnType<typeof getCrashlytics>,
) => {
  fetchInstance()
    .post("", {
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
      recordError(crashlytics, err, "signup fail");
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
  const [nickname, setNickname] = useState<string>("");
  const [sex, setSex] = useState<number>(0);
  const router = useRouter();

  const crashlytics = getCrashlytics();

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollView>
        <Container>
          <View>
            <NoticeText>
              {`강원대학교 학생을 위한 카풀 서비스,
          --- 입니다.`}
            </NoticeText>
          </View>
          <VertifyEmail email={email} setEmail={setEmail} />
          <PersonalInfo
            password={password}
            setPassword={setPassword}
            sex={sex}
            setSex={setSex}
            nickname={nickname}
            setNickname={setNickname}
          />
          <CircleButton
            icon="checkmark"
            onPress={() =>
              handleSignup(email, password, nickname, sex, () => router.push("/"), crashlytics)
            }
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Container = styled.View({
  padding: "0 20px",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

const NoticeText = styled.Text({
  padding: "20px",
  fontSize: FontSizes.medium,
  textAlign: "center",
  width: "100%",
});
