import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import InputContainer from "./input_container";

/**
 * @returns (회원가입 페이지) 닉네임, 성별 입력 필드
 */
export default function PersonalInfo({
  sex,
  setSex,
  nickname,
  setNickname,
}: {
  sex: number;
  setSex: (v: number) => void;
  nickname: string;
  setNickname: (v: string) => void;
}) {
  useEffect(() => {
    fetchInstance()
      .get("/랜덤 닉네임 생성 API")
      .then((res) => setNickname(String(res.data)))
      .catch((err) => {
        //TODO 에러 로깅
        console.error(err);
        setNickname(`이름${Math.floor(Math.random() * 1000)}`);
      });
  }, [setNickname]);

  return (
    <Container>
      <InputContainer title="닉네임">
        <Input value={nickname} onChangeText={setNickname} />
      </InputContainer>
      <InputContainer title="성별">
        <Pressable onPress={() => setSex(0)}>
          <SelectText active={sex === 0}>남성</SelectText>
        </Pressable>
        <Text> / </Text>
        <Pressable onPress={() => setSex(1)}>
          <SelectText active={sex === 1}>여성</SelectText>
        </Pressable>
      </InputContainer>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
});
const Input = styled.TextInput({
  fontSize: FontSizes.medium,
  textAlign: "center",
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
