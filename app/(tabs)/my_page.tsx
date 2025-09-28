import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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
  };
  message?: string;
}

export default function MyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("닉네임");
  const [initialNickname, setInitialNickname] = useState("닉네임");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [email, setEmail] = useState<string | null>("example@email.com");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 모달 전용 상태
  const [modalNickname, setModalNickname] = useState("");
  const [modalPassword, setModalPassword] = useState("");

  // 사용자 정보 가져오기
  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      const token = await authCode.get();
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const profileRes = await fetchInstance(true).get("/api/member/me");
        const nickname = profileRes.data?.nickname ?? "닉네임 없음";
        const email = profileRes.data?.email ?? null;
        const totalSavedAmount = profileRes.data?.totalSavedAmount ?? 0;

        setNickname(nickname);
        setInitialNickname(nickname);
        setEmail(email);
        setSavedAmount(totalSavedAmount); // 여기서 반영
      } catch (error: unknown) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
        setIsLoggedIn(false);
        Alert.alert("⚠️ 오류", "회원 정보를 불러오지 못했습니다.");
      }
    };

    checkTokenAndFetchUser();
  }, []);

  const openModal = () => {
    setModalNickname("");
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

      if (res.data.nickname) {
        setNickname(res.data.nickname);
        setInitialNickname(res.data.nickname);
      }

      // 업데이트 후 금액도 다시 가져오기
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
      console.error("❌ 수정 실패:", msg);
      Alert.alert("❌ 수정 실패", msg);
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
            setIsLoggedIn(false);
            Alert.alert("로그아웃 완료", "정상적으로 로그아웃되었습니다.");
          } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
          }
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
          } catch (error) {
            Alert.alert("삭제 실패", "계정 삭제에 실패했습니다.");
            console.error(error);
          }
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
      <Container>
        <TopContainer />
        <AbsoluteTopOverlay>
          <TopHalf>
            <ProfileImage source={defaultProfile} />
            <LoginGuideText>로그인이 필요합니다.</LoginGuideText>
            <LoginGuideButton onPress={() => router.push("/signin")}>
              <LoginGuideText>로그인 하러 가기 &gt;</LoginGuideText>
            </LoginGuideButton>
          </TopHalf>
        </AbsoluteTopOverlay>
        <BottomContainer />
      </Container>
    );
  }

  return (
    <Container>
      <TopContainer />
      <AbsoluteTopOverlay>
        <TopHalf>
          <TopRow>
            <TextContainer>
              <NicknameText>{nickname}</NicknameText>
              <EmailBox>
                <EmailText>{email ?? "이메일 정보 없음"}</EmailText>
              </EmailBox>
            </TextContainer>
            <ProfileImage source={defaultProfile} />
          </TopRow>
        </TopHalf>
      </AbsoluteTopOverlay>

      {/* 저장 금액 표시 */}
      <OverlapBox>
        <Row>
          <Ionicons name="wallet" size={30} color="#4a90e2" />
          <InfoText>지금까지 {savedAmount.toLocaleString()}원 아꼈어요!</InfoText>
        </Row>
      </OverlapBox>

      <BottomContainer>
        <BottomHalf>
          {/* 정보 변경 버튼 */}
          <ActionButton bgColor="#4a90e2" onPress={openModal}>
            <ActionButtonText>정보 변경</ActionButtonText>
          </ActionButton>

          {/* 로그아웃 버튼 */}
          <ActionButton bgColor="#f1c40f" onPress={handleLogout}>
            <ActionButtonText>로그아웃</ActionButtonText>
          </ActionButton>

          {/* 계정 삭제 버튼 */}
          <ActionButton bgColor="#e74c3c" onPress={handleDeleteAccount}>
            <ActionButtonText>계정 삭제하기</ActionButtonText>
          </ActionButton>
        </BottomHalf>
      </BottomContainer>

      {/* 정보 변경 모달 */}
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
  );
}

/* ------------------- Styled Components ------------------- */
const { width } = Dimensions.get("window");

const Container = styled(View)({
  flex: 1,
  backgroundColor: "#f0f0f0",
  alignItems: "center",
  justifyContent: "flex-start",
});

const TopContainer = styled(View)({
  width: width * 1.6,
  height: width * 1.6,
  borderRadius: (width * 1.6) / 2,
  overflow: "hidden",
  top: -width * 0.3,
  position: "relative",
  backgroundColor: "rgb(148, 200, 230)",
});

const AbsoluteTopOverlay = styled(View)({
  position: "absolute",
  top: 0,
  width: "100%",
  height: "35%",
});

const TopHalf = styled(View)({
  flex: 1.6,
  paddingHorizontal: 20,
  justifyContent: "center",
});

const BottomHalf = styled(View)({
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 130,
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

const BottomContainer = styled(View)({
  flex: 0.35,
  width: "100%",
  backgroundColor: "#f0f0f0",
});

const OverlapBox = styled(View)({
  position: "absolute",
  top: "52%",
  alignSelf: "center",
  width: 380,
  height: 100,
  backgroundColor: "#ffffff",
  borderRadius: 20,
  zIndex: 10,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 8,
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

const ActionButton = styled(TouchableOpacity)<{ bgColor?: string }>({
  width: 110,
  height: 60,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: ({ bgColor }) => bgColor || "#4a90e2",
  opacity: 0.85,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 6,
});

const ActionButtonText = styled(Text)({
  fontSize: 16,
  fontWeight: "bold",
  color: "#fff",
});

const Row = styled(View)({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
  marginTop: 10,
});

const InfoText = styled(Text)({
  fontSize: 20,
  color: "#4a4a4a",
  marginLeft: 8,
});

const LoginGuideButton = styled(TouchableOpacity)({
  backgroundColor: "#4a90e2",
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 25,
  marginTop: 16,
});

const LoginGuideText = styled(Text)({
  color: "white",
  fontSize: 16,
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

const ModalButton = styled(TouchableOpacity)<{ bgColor?: string }>({
  width: "100%",
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: ({ bgColor }) => bgColor || "#4a90e2",
  justifyContent: "center",
  alignItems: "center",
});

const ModalButtonText = styled(Text)({
  fontSize: 16,
  fontWeight: "bold",
  color: "#fff",
});
