import { Text, TouchableWithoutFeedback } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "@/entities/common/util/style_var";

import InputContainer from "./input_container";

/**
 * @returns (회원가입 페이지) 닉네임, 성별 입력 필드
 */
export default function PersonalInfo({
  sex,
  setSex,
}: {
  sex: number;
  setSex: (v: number) => void;
}) {
  return (
    <Container>
      <InputContainer title="닉네임">
        <Input />
      </InputContainer>
      <InputContainer title="성별">
        <TouchableWithoutFeedback onPress={() => setSex(0)}>
          <SelectText active={sex === 0}>남성</SelectText>
        </TouchableWithoutFeedback>
        <Text> / </Text>
        <TouchableWithoutFeedback onPress={() => setSex(1)}>
          <SelectText active={sex === 1}>여성</SelectText>
        </TouchableWithoutFeedback>
      </InputContainer>
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
const SelectText = styled.Text<{ active: boolean }>((props) =>
  props.active
    ? {
        fontWeight: "bold",
        color: Colors.main,
      }
    : {},
);
