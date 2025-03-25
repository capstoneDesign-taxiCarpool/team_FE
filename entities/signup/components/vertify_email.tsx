import styled from "styled-components/native";

import BasicButton from "@/entities/common/components/button_basic";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import InputContainer from "./input_container";

/**
 * @returns (회원가입 페이지) 이메일 입력 및 인증 필드
 */
export default function VertifyEmail() {
  return (
    <Container>
      <InputContainer title="강원대 이메일">
        <Input placeholder="--- @kangwon.ac.kr" />
      </InputContainer>
      <SendCodeButton>
        <BasicButton title="인증코드 보내기" icon="paperplane.circle" onPress={() => {}} />
      </SendCodeButton>
      <VertifyCode autoCapitalize="characters" maxLength={6} placeholder="인증코드 입력" />
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const Input = styled.TextInput({
  fontSize: FontSizes.medium,
  border: "none",
});
const SendCodeButton = styled.View({
  display: "flex",
  flexDirection: "row-reverse",
});

const VertifyCode = styled.TextInput({
  padding: "1rem",
  fontSize: FontSizes.large2,
  borderColor: Colors.main,
  borderWidth: "2px",
  borderRadius: "20px",
  textAlign: "center",
});
