import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";

import { authCode as authCodeStorage } from "@/entities/common/util/storage";

import defaultProfile from "../../assets/images/default-profile.png";

export default function MyPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("홍길동");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  useEffect(() => {
    authCodeStorage.get().then((code) => {
      if (code) {
        setIsLoggedIn(true);

        fetch("https://your-api.com/user/savings")
          .then((res) => res.json())
          .then((data) => setSavedAmount(data.amount ?? 0))
          .catch(() => setSavedAmount(0));
      }
    });
  }, []);

  const handleLoginToggle = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setSavedAmount(0);
    } else {
      authCodeStorage.set("dummy");
      setIsLoggedIn(true);
    }
  };

  return (
    <Container>
      <Inner>
        <ProfileImage source={defaultProfile} />

        {isLoggedIn ? (
          <>
            <NicknameTouchable onPress={() => setIsEditing(true)}>
              {isEditing ? (
                <NicknameInput
                  value={nickname}
                  onChangeText={setNickname}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                />
              ) : (
                <NicknameText>{nickname}님, 반가워요!</NicknameText>
              )}
            </NicknameTouchable>

            <Row>
              <Ionicons name="wallet" size={20} color="#4a90e2" />
              <InfoText>지금까지 {savedAmount?.toLocaleString() ?? "0"}원 아꼈어요!</InfoText>
            </Row>

            <SettingButton onPress={() => router.push("/notification-settings")}>
              <CenteredRow>
                <Feather name="bell" size={18} color="#4a90e2" />
                <ButtonText>앱 푸시 알람 설정하기 &gt;</ButtonText>
              </CenteredRow>
            </SettingButton>

            <DeleteButton onPress={() => alert("계정 삭제하기 기능")}>
              <DeleteText>계정 삭제하기</DeleteText>
            </DeleteButton>
          </>
        ) : (
          <LoginGuideButton onPress={() => router.push("/signup")}>
            <LoginGuideText>로그인 후 이용해주세요 &gt;</LoginGuideText>
          </LoginGuideButton>
        )}
      </Inner>

      <FloatingButton onPress={handleLoginToggle}>
        <FloatingButtonText>{isLoggedIn ? "로그아웃" : "로그인"}</FloatingButtonText>
      </FloatingButton>
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
});

const LoginGuideText = styled(Text)({
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
});

const FloatingButton = styled(TouchableOpacity)({
  position: "absolute",
  bottom: 30,
  right: 30,
  backgroundColor: "#4a90e2",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 30,
  elevation: 5,
});

const FloatingButtonText = styled(Text)({
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
});
