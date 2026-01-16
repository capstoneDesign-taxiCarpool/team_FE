import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import styled from "styled-components/native";

import BasicButton from "@/entities/common/components/button_basic";
import { ColContainer } from "@/entities/common/components/containers";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = () => {
    if (!email) {
      Alert.alert("알림", "이메일을 입력해주세요.");
      return;
    }
    setLoading(true); // 로딩 시작
    fetchInstance()
      .post("/api/password/reset-link", { email: email.trim() + "@kangwon.ac.kr" })
      .then(() => {
        Alert.alert("알림", "비밀번호 재설정 링크가 이메일로 전송되었습니다.");
        router.back();
      })
      .catch((err) => {
        Alert.alert("오류", err.response?.data?.message || "이메일 전송에 실패했습니다.");
      })
      .finally(() => {
        setLoading(false); // 로딩 종료
      });
  };

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true); // 로딩 시작
    fetchInstance()
      .patch("/api/password/reset", { token, newPassword: password })
      .then(() => {
        Alert.alert("알림", "비밀번호가 성공적으로 변경되었습니다.");
        router.replace("/signin");
      })
      .catch((err) => {
        Alert.alert("오류", err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
      })
      .finally(() => {
        setLoading(false); // 로딩 종료
      });
  };

  return (
    <Pressable style={{ flex: 1, width: "100%" }} onPress={Keyboard.dismiss}>
      {/* ✅ 로딩 오버레이 (API 응답 대기 중 화면 조작 방지) */}
      <Modal transparent visible={loading} animationType="fade">
        <LoadingOverlay>
          <LoadingBox>
            <ActivityIndicator size="large" color={Colors.main} />
            <LoadingText>요청 처리 중...</LoadingText>
          </LoadingBox>
        </LoadingOverlay>
      </Modal>

      <Container behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <LoginContainer>
          <NoticeText>
            <BoldText>비밀번호 재설정</BoldText>
          </NoticeText>

          {!token ? (
            <>
              <Description>
                가입한 이메일 주소를 입력하시면{"\n"}
                비밀번호 재설정 링크를 보내드립니다.
              </Description>

              <InputsWrapper>
                <InputBox>
                  <Label>강원대 메일</Label>
                  <StyledInputRow>
                    <StyledInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="이메일을 입력하세요"
                      placeholderTextColor={Colors.darkGray}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onPressIn={(e) => e.stopPropagation?.()}
                    />
                    <MailText>@kangwon.ac.kr</MailText>
                  </StyledInputRow>
                </InputBox>
              </InputsWrapper>

              <Pressable onPress={(e) => e.stopPropagation?.()}>
                <BasicButton
                  title={loading ? "전송 중..." : "인증 메일 보내기"}
                  icon="paperplane.fill"
                  onPress={() => {
                    Keyboard.dismiss();
                    handleRequestReset();
                  }}
                  color={Colors.main}
                  disabled={loading}
                />
              </Pressable>
            </>
          ) : (
            <>
              <Description>새로운 비밀번호를 입력해주세요.</Description>

              <InputsWrapper>
                <InputBox>
                  <Label>새 비밀번호</Label>
                  <StyledInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor={Colors.darkGray}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onPressIn={(e) => e.stopPropagation?.()}
                  />
                </InputBox>

                <InputBox>
                  <Label>비밀번호 확인</Label>
                  <StyledInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="비밀번호를 다시 입력하세요"
                    placeholderTextColor={Colors.darkGray}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onPressIn={(e) => e.stopPropagation?.()}
                  />
                </InputBox>
              </InputsWrapper>

              <Pressable onPress={(e) => e.stopPropagation?.()}>
                <BasicButton
                  title={loading ? "변경 중..." : "비밀번호 변경하기"}
                  icon="checkmark"
                  onPress={() => {
                    Keyboard.dismiss();
                    handleResetPassword();
                  }}
                  color={Colors.main}
                  disabled={loading}
                />
              </Pressable>
            </>
          )}
        </LoginContainer>
      </Container>
    </Pressable>
  );
}

// --- Styled Components ---

const LoadingOverlay = styled.View({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  justifyContent: "center",
  alignItems: "center",
});

const LoadingBox = styled.View({
  backgroundColor: "white",
  padding: 30,
  borderRadius: 15,
  alignItems: "center",
  gap: 15,
});

const LoadingText = styled.Text({
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
});

const BoldText = styled.Text({
  fontWeight: "700",
  color: Colors.black,
  fontSize: FontSizes.large2,
});

const Container = styled(KeyboardAvoidingView)({
  width: "100%",
  height: "100%",
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
});

const LoginContainer = styled.View({
  width: "95%",
  backgroundColor: "rgb(148, 200, 230)",
  borderRadius: 16,
  paddingVertical: 30,
  paddingHorizontal: 15,
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
  textAlign: "center",
  fontWeight: "600",
  color: Colors.black,
  width: "100%",
});

const Description = styled.Text({
  fontSize: FontSizes.medium,
  color: Colors.black,
  textAlign: "center",
});

const InputsWrapper = styled(ColContainer)({
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
