import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";

import defaultProfile from "../../assets/images/default-profile.png";

type UpdatePayload = {
  newNickname: string;
  empty: boolean;
  newPassword?: string;
};

export default function MyPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("닉네임");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profileRes = await fetchInstance(true).get("https://knu-carpool.store/api/member/me");
        setNickname(profileRes.data.nickname ?? "닉네임 없음");
        setIsLoggedIn(true);

        const savingsRes = await fetchInstance(true).get("/api/members/savings");
        setSavedAmount(savingsRes.data?.amount ?? 0);
      } catch (error) {
        console.error("로그인 확인 또는 데이터 불러오기 실패", error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      const payload: UpdatePayload = {
        newNickname: nickname,
        empty: true,
      };

      if (password) {
        payload.newPassword = password;
      }

      const res = await fetchInstance(true).patch(
        "https://knu-carpool.store/api/member/me",
        payload,
      );
      setNickname(res.data.nickname ?? nickname);
      Alert.alert("✅ 수정 완료", "회원 정보가 수정되었습니다.");
    } catch (error) {
      Alert.alert("❌ 수정 실패", "닉네임 또는 비밀번호 수정에 실패했습니다.");
      console.error(error);
    } finally {
      setIsEditing(false);
      setPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert("⚠️ 계정 삭제", "정말로 계정을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await fetchInstance(true).delete("https://knu-carpool.store/api/member/me");
            router.replace("/index");
          } catch (error) {
            Alert.alert("삭제 실패", "계정 삭제에 실패했습니다.");
            console.error(error);
          }
        },
      },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <Container>
        <Inner>
          <ProfileImage source={defaultProfile} />
          <LoginGuideText>로그인이 필요합니다.</LoginGuideText>
          <LoginGuideButton onPress={() => router.push("/signin")}>
            <LoginGuideText>로그인 하러 가기 &gt;</LoginGuideText>
          </LoginGuideButton>
        </Inner>
      </Container>
    );
  }

  return (
    <Container>
      <Inner>
        <ProfileImage source={defaultProfile} />

        <NicknameTouchable onPress={() => setIsEditing(true)}>
          {isEditing ? (
            <>
              <NicknameInput value={nickname} onChangeText={setNickname} placeholder="닉네임" />
              <NicknameInput
                value={password}
                onChangeText={setPassword}
                placeholder="변경할 비밀번호"
                secureTextEntry
              />
              <ConfirmButton onPress={handleUpdate}>
                <ConfirmText>수정 완료</ConfirmText>
              </ConfirmButton>
            </>
          ) : (
            <NicknameText>{nickname}님, 반가워요!</NicknameText>
          )}
        </NicknameTouchable>

        <Row>
          <Ionicons name="wallet" size={20} color="#4a90e2" />
          <InfoText>지금까지 {savedAmount.toLocaleString()}원 아꼈어요!</InfoText>
        </Row>

        <SettingButton onPress={() => router.push("/notification-settings")}>
          <CenteredRow>
            <Feather name="bell" size={18} color="#4a90e2" />
            <ButtonText>앱 푸시 알람 설정하기 &gt;</ButtonText>
          </CenteredRow>
        </SettingButton>

        <DeleteButton onPress={handleDeleteAccount}>
          <DeleteText>계정 삭제하기</DeleteText>
        </DeleteButton>
      </Inner>
    </Container>
  );
}

// ✅ 스타일 정의
const Container = styled(View)({
  flex: 1,
  backgroundColor: "#ffffff",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 80,
});

const Inner = styled(View)({
  alignItems: "center",
  width: "100%",
  paddingHorizontal: 20,
});

const ProfileImage = styled(Image)({
  width: 100,
  height: 100,
  borderRadius: 50,
  marginBottom: 16,
});

const NicknameTouchable = styled(TouchableOpacity)({
  marginBottom: 20,
});

const NicknameText = styled(Text)({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  borderBottomWidth: 1,
  borderBottomColor: "#ccc",
  paddingBottom: 4,
});

const NicknameInput = styled(TextInput)({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  borderBottomWidth: 1,
  borderBottomColor: "#aaa",
  paddingVertical: 4,
  width: 200,
  textAlign: "center",
  marginBottom: 8,
});

const ConfirmButton = styled(TouchableOpacity)({
  width: 200,
  height: 50,
  backgroundColor: "#4a90e2",
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 40,
  justifyContent: "center",
  alignItems: "center",
});

const ConfirmText = styled(Text)({
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
});

const Row = styled(View)({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
});

const InfoText = styled(Text)({
  fontSize: 16,
  color: "#4a4a4a",
  marginLeft: 8,
});

const SettingButton = styled(TouchableOpacity)({
  paddingVertical: 10,
  paddingHorizontal: 14,
  backgroundColor: "#e8f4ff",
  borderRadius: 10,
  marginBottom: 20,
});

const CenteredRow = styled(View)({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
});

const ButtonText = styled(Text)({
  fontSize: 15,
  color: "#4a90e2",
  marginLeft: 6,
});

const DeleteButton = styled(TouchableOpacity)({});

const DeleteText = styled(Text)({
  fontSize: 14,
  color: "#e74c3c",
  fontWeight: "bold",
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
