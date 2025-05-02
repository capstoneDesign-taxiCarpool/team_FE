import React from "react";
import { Alert, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

export default function HomeScreen() {
  return (
    <Container>
      <ScheduleBox onPress={() => Alert.alert("스케줄 페이지로 이동합니다")}>
        <BoxText>Schedule</BoxText>
      </ScheduleBox>

      <PartyBox onPress={() => Alert.alert("파티 참여로 이동합니다")}>
        <BoxText>카풀 모집하기</BoxText>
      </PartyBox>

      <PartyBox onPress={() => Alert.alert("파티 생성으로 이동합니다")}>
        <BoxText>카풀 참여하기</BoxText>
      </PartyBox>
    </Container>
  );
}

// ✅ 공통 컨테이너
const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
});

// ✅ 공통 Box 스타일 (PartyJoin / PartyMake)
const PartyBox = styled(TouchableOpacity)({
  width: 180,
  height: 80,
  backgroundColor: "#4A90E2",
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

// ✅ Schedule 전용 스타일 (원하면 PartyBox와 같게 바꿔도 됨)
const ScheduleBox = styled(TouchableOpacity)({
  width: 180,
  height: 80,
  backgroundColor: "#50C878", // 다른 색상
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

// ✅ 텍스트 공통 스타일
const BoxText = styled.Text({
  fontSize: 18,
  color: "#ffffff",
  fontWeight: "bold",
});
