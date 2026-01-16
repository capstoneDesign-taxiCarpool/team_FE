import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import styled from "styled-components/native";

import { ColContainer } from "@/entities/common/components/containers";
import InputContainer from "@/entities/common/components/input_container";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

/**
 * @returns (회원가입 페이지) 비밀번호, 닉네임, 성별 입력 필드
 */
export default function PersonalInfo({
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  sex,
  setSex,
  nickname,
  setNickname,
}: {
  password: string;
  setPassword: (v: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (v: string) => void;
  sex: number;
  setSex: (v: number) => void;
  nickname: string;
  setNickname: (v: string) => void;
}) {
  useEffect(() => {
    setNickname(`이름${Math.floor(Math.random() * 1000)}`);
  }, [setNickname]);

  return (
    <Container>
      <ColContainer alignItems="flex-end" gap={7}>
        <InputContainer title="비밀번호">
          <Input
            value={password}
            onChangeText={(v) => setPassword(v.trim())}
            secureTextEntry
            autoCapitalize="none"
            placeholder="비밀번호를 입력하세요"
          />
        </InputContainer>
        <PasswordCheckText>
          {password.length > 8 &&
          password.length <= 20 &&
          password.match(/[a-zA-Z]/) &&
          password.match(/\d/)
            ? "✅ 사용가능한 비밀번호입니다."
            : "❌ 비밀번호는 영문과 숫자를 포함한 8~20자여야 합니다."}
        </PasswordCheckText>
        <InputContainer title="비밀번호 확인">
          <Input
            value={passwordConfirm}
            onChangeText={(v) => setPasswordConfirm(v.trim())}
            secureTextEntry
            autoCapitalize="none"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </InputContainer>
      </ColContainer>
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
  gap: "10px",
});
const Input = styled.TextInput({
  fontSize: FontSizes.medium,
  textAlign: "center",
  border: "none",
  flexGrow: 1,
});

const PasswordCheckText = styled.Text({
  fontSize: FontSizes.small,
});

const SelectText = styled.Text<{ active: boolean }>((props) =>
  props.active
    ? {
        fontWeight: "bold",
        fontSize: FontSizes.medium,
        color: Colors.side,
      }
    : {
        fontSize: FontSizes.medium,
      },
);
