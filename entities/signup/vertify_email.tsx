import { useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import styled from "styled-components/native";

import BasicButton from "@/entities/common/components/button_basic";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import InputContainer from "./input_container";

type CheckState =
  | "before_send_code"
  | "code_sending"
  | "code_sended"
  | "vertifying"
  | "vertify_fail"
  | "vertify_success";

/**
 * 이메일을 입력받고, 서버에 인증코드 전송 요청
 */
const handleSendCode = (email: string, setCheckState: (v: CheckState) => void) => {
  setCheckState("code_sending");
  fetchInstance()
    .post("/api/email/send", { email: email.trim() + "@kangwon.ac.kr" })
    .then(() => setCheckState("code_sended"))
    .catch(() => {
      setCheckState("before_send_code");
      Alert.alert("이메일 전송 실패", "이메일을 다시 확인해주세요");
    });
};
/**
 * 인증코드를 입력받고, 서버에 인증코드 확인 요청
 * @param v 인증코드
 */
const vertifyCode = (
  v: string,
  checkState: CheckState,
  email: string,
  setEmailCode: (v: string) => void,
  setCheckState: (v: CheckState) => void,
) => {
  if (checkState === "before_send_code" || checkState === "vertify_success") return;
  setEmailCode(v);
  if (v.length !== 6) {
    setCheckState("code_sended");
    return;
  }
  setCheckState("vertifying");

  fetchInstance()
    .post("/api/email/verify", { email: email.trim() + "@kangwon.ac.kr", code: v })
    .then(() => {
      setCheckState("vertify_success");
    })
    .catch(() => {
      setCheckState("vertify_fail");
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
  const [checkState, setCheckState] = useState<CheckState>("before_send_code");
  const emailRef = useRef<TextInput>(null);

  return (
    <Container>
      <AlignRight>
        <InputContainer
          title="강원대 메일"
          handleClick={() => {
            emailRef.current?.focus();
          }}
        >
          <Input ref={emailRef} value={email} onChangeText={setEmail} />
          <MailText>@kangwon.ac.kr</MailText>
        </InputContainer>
        <BasicButton
          title="인증코드 보내기"
          icon="paperplane.fill"
          onPress={() => handleSendCode(email, setCheckState)}
          disabled={checkState !== "before_send_code"}
        />
      </AlignRight>
      <AlignRight>
        <VertifyCode
          autoCapitalize="characters"
          maxLength={6}
          value={emailCode}
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          placeholder="인증코드 입력"
          onChangeText={(v) => vertifyCode(v, checkState, email, setEmailCode, setCheckState)}
        />
        <VertifyResult>
          {checkState === "code_sending" && "인증코드를 보내는 중..."}
          {checkState === "code_sended" && "인증코드를 입력해주세요"}
          {checkState === "vertify_fail" && "❌ 인증코드를 다시 확인해주세요"}
          {checkState === "vertify_success" && "✅ 확인되었습니다"}
          {checkState === "vertifying" && "확인 중..."}
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

const Input = styled(TextInput)({
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
