import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground } from "react-native";
import styled from "styled-components/native";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Container>
      <ScheduleBox onPress={() => router.push("/schedule")}>
        <BoxText>Schedule</BoxText>
      </ScheduleBox>

      <PartyBox source={partyMakeImage}>
        <OverlayTouchable onPress={() => router.push("../chatpage")}>
          <BoxText>카풀 모집하기</BoxText>
        </OverlayTouchable>
      </PartyBox>

      <PartyBox source={partyJoinImage}>
        <OverlayTouchable onPress={() => router.push("/partyjoin")}>
          <BoxText>카풀 참여하기</BoxText>
        </OverlayTouchable>
      </PartyBox>
    </Container>
  );
}

// 전체 화면 컨테이너
const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
});

// Schedule 버튼
const ScheduleBox = styled.TouchableOpacity({
  width: 400,
  height: 80,
  backgroundColor: "#50C878",
  borderRadius: 40,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

// 배경 이미지 박스
const PartyBox = styled(ImageBackground).attrs({
  imageStyle: {
    borderRadius: 40,
  },
})({
  width: 400,
  height: 200,
  marginBottom: 16,
  overflow: "hidden",
});

// 오버레이 터치 가능 영역
const OverlayTouchable = styled.TouchableOpacity({
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

// 텍스트
const BoxText = styled.Text({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333333",
});
