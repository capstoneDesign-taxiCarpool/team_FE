import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import defaultProfile from "../../assets/images/default-profile.png";

type UpdatePayload = {
  newNickname?: string;
  newPassword?: string;
};

interface ApiErrorResponse {
  errors?: {
    newNickname?: string;
    newPassword?: string;
    newPasswordCheck?: string;
  };
  message?: string;
}

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = Dimensions.get("window");

  const [nickname, setNickname] = useState("닉네임");
  const [initialNickname, setInitialNickname] = useState("닉네임");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [email, setEmail] = useState<string | null>("example@email.com");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalNickname, setModalNickname] = useState("");
  const [modalPassword, setModalPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      const checkTokenAndFetchUser = async () => {
        const token = await authCode.get();
        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);

        try {
          const profileRes = await fetchInstance(true).get("/api/member/me");
          setNickname(profileRes.data?.nickname ?? "닉네임 없음");
          setInitialNickname(profileRes.data?.nickname ?? "닉네임 없음");
          setEmail(profileRes.data?.email ?? null);
          setSavedAmount(profileRes.data?.totalSavedAmount ?? 0);
        } catch (error) {
          setIsLoggedIn(false);
        }
      };

      checkTokenAndFetchUser();
    }, []),
  );

  const openModal = () => {
    setModalNickname(initialNickname);
    setModalPassword("");
    setIsModalVisible(true);
  };

  const handleUpdateInfo = async () => {
    if (!modalNickname && !modalPassword) {
      setIsModalVisible(false);
      return;
    }

    try {
      const payload: UpdatePayload = {};
      if (modalNickname) payload.newNickname = modalNickname;
      if (modalPassword) payload.newPassword = modalPassword;

      const res = await fetchInstance(true).patch("/api/member/me", payload);

      if (res.data.nickname) setNickname(res.data.nickname);
      if (res.data.totalSavedAmount !== undefined) {
        setSavedAmount(res.data.totalSavedAmount);
      }

      Alert.alert("✅ 수정 완료", "정보가 수정되었습니다.");
    } catch (error: unknown) {
      let msg = "정보 수정에 실패했습니다.";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: ApiErrorResponse } };
        msg =
          err.response?.data?.errors?.newNickname ||
          err.response?.data?.errors?.newPassword ||
          err.response?.data?.message ||
          msg;
      }
    } finally {
      setModalNickname("");
      setModalPassword("");
      setIsModalVisible(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("⚠️ 로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            await authCode.set(null);
            queryClient.invalidateQueries({ queryKey: ["parties", "my"] });
            setIsLoggedIn(false);
            Alert.alert("로그아웃 완료", "정상적으로 로그아웃되었습니다.");
          } catch (error) {}
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert("⚠️ 계정 삭제", "정말로 계정을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await fetchInstance(true).delete("/api/member/me");
            await authCode.set(null);
            setIsLoggedIn(false);
          } catch (error) {}
        },
      },
    ]);
  };

  if (isLoggedIn === null) {
    return (
      <Container>
        <Inner>
          <LoginGuideText>로그인 상태 확인 중...</LoginGuideText>
        </Inner>
      </Container>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
            <Container>
              <TopContainer width={width} />
              <AbsoluteTopOverlay>
                <TopHalf>
                  <TopRow>
                    <TextContainer>
                      <NicknameText>닉네임</NicknameText>
                      <EmailBox>
                        <EmailText>로그인이 필요합니다.</EmailText>
                      </EmailBox>
                    </TextContainer>
                    <ProfileImageContainer>
                      <ProfileImage source={defaultProfile} />
                    </ProfileImageContainer>
                  </TopRow>
                </TopHalf>
              </AbsoluteTopOverlay>

              <OverlapGroup>
                <SavedBox>
                  <LoginGuideButton onPress={() => router.push("/signin")}>
                    <LoginGuideText>로그인 하러 가기 &gt;</LoginGuideText>
                  </LoginGuideButton>
                </SavedBox>
              </OverlapGroup>
            </Container>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
          <Container>
            <TopContainer width={width} />

            <AbsoluteTopOverlay>
              <TopHalf>
                <TopRow>
                  <TextContainer>
                    <NicknameText>{nickname}</NicknameText>
                    <EmailBox>
                      <EmailText>{email ?? "이메일 정보 없음"}</EmailText>
                    </EmailBox>
                  </TextContainer>
                  <ProfileImageContainer>
                    <ProfileImage source={defaultProfile} />
                  </ProfileImageContainer>
                </TopRow>
              </TopHalf>
            </AbsoluteTopOverlay>
            <OverlapGroup>
              <SavedBox>
                <Row>
                  <Ionicons name="wallet" size={30} color="#4a90e2" />
                  <InfoText>지금까지 {savedAmount.toLocaleString()}원 아꼈어요!</InfoText>
                </Row>
              </SavedBox>

              <ActionButtonsRow>
                <ActionButton bgColor="#4a90e2" onPress={openModal}>
                  <ActionButtonText>정보 변경</ActionButtonText>
                </ActionButton>
                <ActionButton bgColor="#f1c40f" onPress={handleLogout}>
                  <ActionButtonText>로그아웃</ActionButtonText>
                </ActionButton>
                <ActionButton bgColor="#e74c3c" onPress={handleDeleteAccount}>
                  <ActionButtonText>계정 삭제</ActionButtonText>
                </ActionButton>
              </ActionButtonsRow>
            </OverlapGroup>

            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setIsModalVisible(false)}
            >
              <ModalOverlay>
                <ModalContainer>
                  <ModalTitle>정보 변경</ModalTitle>
                  <ModalInput
                    placeholder="변경할 닉네임을 입력해주세요!"
                    value={modalNickname}
                    onChangeText={setModalNickname}
                  />
                  <ModalInput
                    placeholder="비밀번호를 변경하려면 입력해주세요!"
                    value={modalPassword}
                    onChangeText={setModalPassword}
                    secureTextEntry
                  />
                  <Text style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                    비밀번호를 변경하지 않으려면 기존 비밀번호를 입력해주세요!
                  </Text>
                  <ModalButton onPress={handleUpdateInfo}>
                    <ModalButtonText>수정 완료</ModalButtonText>
                  </ModalButton>
                  <ModalButton bgColor="#aaa" onPress={() => setIsModalVisible(false)}>
                    <ModalButtonText>취소</ModalButtonText>
                  </ModalButton>
                </ModalContainer>
              </ModalOverlay>
            </Modal>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Container = styled(View)({
  flex: 1,
  backgroundColor: "#f0f0f0",
  alignItems: "center",
  justifyContent: "flex-start",
});

const TopContainer = styled(View)<{ width: number }>(({ width }) => ({
  width: Math.min(width * 1.6, 500),
  height: "77%",
  borderRadius: Math.min(width * 1.6, 500) / 3,
  overflow: "hidden",
  top: -width * 0.3,
  position: "relative",
  backgroundColor: "rgb(148, 200, 230)",
}));

const AbsoluteTopOverlay = styled(View)({
  position: "absolute",
  top: 0,
  width: "100%",
  height: "40%",
});

const TopHalf = styled(View)({
  flex: 1.6,
  paddingHorizontal: 20,
  justifyContent: "center",
});

const TopRow = styled(View)({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

const TextContainer = styled(View)({
  flexDirection: "column",
  alignItems: "flex-start",
});

const EmailBox = styled(View)({
  marginTop: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
  backgroundColor: "rgba(255,255,255,0.3)",
  borderRadius: 12,
});

const EmailText = styled(Text)({
  fontSize: 16,
  color: "#333",
});

const ProfileImage = styled(Image)({
  width: 140,
  height: 140,
  borderRadius: 70,
});

const NicknameText = styled(Text)({
  fontSize: 30,
  fontWeight: "bold",
  color: "#333",
  marginLeft: 4,
});

const OverlapGroup = styled(View)({
  position: "absolute",
  top: "54%",
  width: "100%",
  alignItems: "center",
  zIndex: 10,
});

const SavedBox = styled(View)({
  width: "90%",
  backgroundColor: "#ffffff",
  borderRadius: 20,
  paddingVertical: 20,
  paddingHorizontal: 16,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
  marginBottom: 16,
});

const ActionButtonsRow = styled(View)({
  width: "90%",
  flexDirection: "row",
  justifyContent: "space-between",
});

const ActionButton = styled(TouchableOpacity)<{ bgColor?: string }>(({ bgColor }) => ({
  flex: 1,
  height: 50,
  marginHorizontal: 4,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 15,
  backgroundColor: bgColor || "#4a90e2",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 2,
}));

const ActionButtonText = styled(Text)({
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
});

const Row = styled(View)({
  flexDirection: "row",
  alignItems: "center",
});

const InfoText = styled(Text)({
  fontSize: 18,
  color: "#333",
  marginLeft: 7,
});

const LoginGuideButton = styled(TouchableOpacity)({
  width: "100%",
  paddingVertical: 20,
  borderRadius: 15,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#ffffff",
});

const LoginGuideText = styled(Text)({
  color: "#333",
  fontSize: 20,
  fontWeight: "bold",
});

const Inner = styled(View)({
  alignItems: "center",
  width: "100%",
  paddingHorizontal: 20,
});

const ModalOverlay = styled(View)({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
});

const ModalContainer = styled(View)({
  width: 300,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 20,
  alignItems: "center",
});

const ModalTitle = styled(Text)({
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 12,
});

const ModalInput = styled(TextInput)({
  width: "100%",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  marginBottom: 12,
});

const ModalButton = styled(TouchableOpacity)<{ bgColor?: string }>(({ bgColor }) => ({
  width: "100%",
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: bgColor || "#4a90e2",
  justifyContent: "center",
  alignItems: "center",
}));

const ModalButtonText = styled(Text)({
  fontSize: 16,
  fontWeight: "bold",
  color: "#fff",
});

const ProfileImageContainer = styled(View)({
  position: "relative",
  width: 140,
  height: 140,
});
