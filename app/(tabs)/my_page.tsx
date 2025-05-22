import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage"; // ✅ 수정 추가

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
  const [initialNickname, setInitialNickname] = useState("닉네임");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      const token = await authCode.get(); // ✅ 수정
      console.log("👤 마이페이지 토큰:", token);

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const profileRes = await fetchInstance(true).get("/api/member/me");
        const nickname = profileRes.data?.nickname ?? "닉네임 없음";
        setNickname(nickname);
        setInitialNickname(nickname);
      } catch (error) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
        setIsLoggedIn(false);
        Alert.alert("⚠️ 오류", "회원 정보를 불러오지 못했습니다.");
      }
    };

    checkTokenAndFetchUser();
  }, []);

  const handleUpdate = async () => {
    if (nickname === initialNickname && !password) {
      setIsEditing(false);
      return;
    }

    try {
      const payload: UpdatePayload = {
        newNickname: nickname,
        empty: true,
      };
      if (password) {
        payload.newPassword = password;
      }

      const res = await fetchInstance(true).patch("/api/member/me", payload);
      setNickname(res.data.nickname ?? nickname);
      setInitialNickname(res.data.nickname ?? nickname);
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
            await fetchInstance(true).delete("/api/member/me");
            await authCode.set(null); // ✅ 수정
            setIsLoggedIn(false);
          } catch (error) {
            Alert.alert("삭제 실패", "계정 삭제에 실패했습니다.");
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            await authCode.set(null); // ✅ 수정
            console.log("✅ 로그아웃 완료 - 토큰 삭제됨");
            setIsLoggedIn(false);
            Alert.alert("로그아웃 완료", "정상적으로 로그아웃되었습니다.");
          } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
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
          <NicknameRow>
            <NicknameText>{nickname}님, 반가워요!</NicknameText>
            <EditIcon onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={20} color="#4a90e2" />
            </EditIcon>
          </NicknameRow>
        )}

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

        <LogoutButton onPress={handleLogout}>
          <LogoutText>로그아웃</LogoutText>
        </LogoutButton>

        <DeleteButton onPress={handleDeleteAccount}>
          <DeleteText>계정 삭제하기</DeleteText>
        </DeleteButton>
      </Inner>
    </Container>
  );
}

// 스타일은 그대로 사용

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

const NicknameRow = styled(View)({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
  gap: 6,
});

const NicknameText = styled(Text)({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
});

const EditIcon = styled(TouchableOpacity)({
  padding: 4,
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
  marginTop: 10,
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
  marginTop: 10,
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

const DeleteButton = styled(TouchableOpacity)({
  marginTop: 10,
});

const DeleteText = styled(Text)({
  fontSize: 14,
  color: "#e74c3c",
  fontWeight: "bold",
});

const LogoutButton = styled(TouchableOpacity)({
  paddingVertical: 10,
  paddingHorizontal: 24,
  backgroundColor: "#4a90e2",
  borderRadius: 25,
});

const LogoutText = styled(Text)({
  color: "white",
  fontSize: 16,
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
