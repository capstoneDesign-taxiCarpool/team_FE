import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

const getMySchedule = async () => {
  const res = await fetchInstance(true).get("/api/members/me/party");
  return res.data; // { departure: string, destination: string, when2go: "HH:mm" }
};

export default function HomeScreen() {
  const router = useRouter();

  const { data: schedule, isPending } = useQuery({
    queryKey: ["mySchedule"],
    queryFn: getMySchedule,
  });

  return (
    <Container>
      <ScheduleBox onPress={() => router.push("/schedule")}>
        {isPending || !schedule ? (
          <BoxText>현재 예정된 카풀이 없습니다</BoxText>
        ) : (
          <>
            <BoxText>
              {schedule.departure} &gt; {schedule.destination}
            </BoxText>
            <BoxText>{schedule.when2go}에 예정되어 있습니다.</BoxText>
          </>
        )}
      </ScheduleBox>

      <PartyBox source={partyMakeImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/recruit")}>
          <IconContainer>
            <Feather name="plus" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 모집하기</BoxText>
          <BoxSmallText>직접 카풀방을 만들어보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>

      <PartyBox source={partyJoinImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/join")}>
          <IconContainer>
            <Ionicons name="search" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 참여하기</BoxText>
          <BoxSmallText>다른 카풀방에 참여 해보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>
    </Container>
  );
}

// 스타일 컴포넌트 생략 (기존 동일)

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
});

// Schedule 버튼
{
  /*필요 api
  현재 소속 파티방 정보
  출발지 : string,
  도착지 : string,
  출발시간 : hh:mm*/
}
const ScheduleBox = styled.TouchableOpacity({
  width: 400,
  height: 80,
  backgroundColor: "rgb(148, 200, 230)",
  borderRadius: 40,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

const PartyBox = styled(ImageBackground).attrs({
  imageStyle: {
    borderRadius: 40,
  },
})({
  width: 400,
  height: 200,
  marginBottom: 16,
  overflow: "hidden",
  borderRadius: 50,
});

const OverlayTouchable = styled.TouchableOpacity({
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const IconContainer = styled.View({
  marginBottom: 4,
});

const BoxText = styled.Text({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333333",
});

const BoxSmallText = styled.Text({
  fontSize: 12,
  color: "#333333",
});
