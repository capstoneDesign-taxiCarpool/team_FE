import { useState } from "react";
import { Alert } from "react-native";
import styled from "styled-components/native";

import BasicButton from "@/entities/common/components/button_basic";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import InputContainer from "./input_container";

/**
 * 이메일을 입력받고, 서버에 인증코드 전송 요청
 */
const handleSendCode = (email: string, setCheckState: (v: number) => void) => {
  fetchInstance()
    .post("/api/email/send", { email: email + "@kangwon.ac.kr" })
    .then(() => setCheckState(1))
    .catch(() => {
      Alert.alert("이메일 전송 실패", "이메일을 다시 확인해주세요");
    });
};
/**
 * 인증코드를 입력받고, 서버에 인증코드 확인 요청
 * @param v 인증코드
 */
const vertifyCode = (
  v: string,
  checkState: number,
  email: string,
  setEmailCode: (v: string) => void,
  setCheckState: (v: number) => void,
) => {
  setEmailCode(v);
  if (checkState === 0) return;
  if (v.length !== 6) {
    setCheckState(1);
    return;
  }

  fetchInstance()
    .post("/api/email/verify", { email: email + "@kangwon.ac.kr", code: v })
    .then(() => setCheckState(3))
    .catch((err) => {
      setCheckState(2);
    });
};

/**
 * @returns (회원가입 페이지) 이메일 입력 및 인증 필드
 */
export default function VertifyEmail({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (email: string) => void;
}) {
  const [emailCode, setEmailCode] = useState<string>("");
  // 이메일 인증 단계 상태 | 0: 코드 전송 전, 1: 코드 전송 완료, 2: 인증 코드 틀림, 3: 인증 코드 맞음
  const [checkState, setCheckState] = useState<number>(0);

  return (
    <Container>
      <AlignRight>
        <InputContainer title="강원대 메일">
          <Input value={email} onChangeText={setEmail} />
          <MailText>@kangwon.ac.kr</MailText>
        </InputContainer>
        <BasicButton
          title="인증코드 보내기"
          icon="paperplane.fill"
          onPress={() => handleSendCode(email, setCheckState)}
          disabled={checkState !== 0}
        />
      </AlignRight>
      <AlignRight>
        <VertifyCode
          autoCapitalize="characters"
          maxLength={6}
          value={emailCode}
          placeholderTextColor={Colors.gray}
          placeholder="인증코드 입력"
          onChangeText={(v) => vertifyCode(v, checkState, email, setEmailCode, setCheckState)}
        />
        <VertifyResult>
          {checkState === 1 && "인증코드를 입력해주세요"}
          {checkState === 2 && "❌ 인증코드를 다시 확인해주세요"}
          {checkState === 3 && "✅ 확인되었습니다"}
        </VertifyResult>
      </AlignRight>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const Input = styled.TextInput({
  fontSize: FontSizes.medium,
  maxWidth: "6rem",
  border: "none",
  textAlign: "right",
  flexGrow: 1,
});
const MailText = styled.Text({
  color: Colors.main,
  fontSize: FontSizes.medium,
});

const AlignRight = styled.View({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "7px",
});

const VertifyCode = styled.TextInput({
  padding: "20px",
  width: "100%",
  fontSize: FontSizes.large2,
  borderColor: Colors.main,
  borderWidth: "2px",
  borderRadius: "20px",
  textAlign: "center",
});
const VertifyResult = styled.Text({
  fontSize: FontSizes.small,
});
