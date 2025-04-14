import { useState } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

import CircleButton from "@/entities/common/components/button_circle";
import InnerShadow from "@/entities/common/components/inner_shadow";
import { authCode } from "@/entities/common/util/storage";
import { FontSizes } from "@/entities/common/util/style_var";
import PersonalInfo from "@/entities/signup/personal_info";
import VertifyEmail from "@/entities/signup/vertify_email";

const handleSignup = (emailCode: string, nickname: string, sex: number) => {
  console.log(
    `이메일 코드: ${emailCode} 닉네임: ${nickname}, 성별: ${sex === 0 ? "남성" : "여성"}`,
  );
  authCode.set(emailCode);
};

export default function Signup() {
  const [emailCode, setEmailCode] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [sex, setSex] = useState<number>(0);

  return (
    <Container>
      <View>
        <InnerShadow />
        <NoticeText>
          {`강원대학교 학생을 위한 카풀 서비스 입니다.
        강원대 학생 메일을 적고, 
        “인증코드 보내기” 버튼을 눌러주세요`}
        </NoticeText>
      </View>
      <VertifyEmail emailCode={emailCode} setEmailCode={setEmailCode} />
      <PersonalInfo sex={sex} setSex={setSex} nickname={nickname} setNickname={setNickname} />
      <SubmitButton>
        <CircleButton
          icon="magnifyingglass.circle"
          onPress={() => handleSignup(emailCode, nickname, sex)}
        />
      </SubmitButton>
    </Container>
  );
}

const Container = styled.View({
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
});

const NoticeText = styled.Text({
  padding: "1rem",
  fontSize: FontSizes.medium,
  textAlign: "center",
  width: "100%",
});

const SubmitButton = styled.View({
  display: "flex",
  alignItems: "center",
});
