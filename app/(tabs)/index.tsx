import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isToday, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

type Party = {
  id: number;
  startPlace: { name: string };
  endPlace: { name: string };
  startDateTime: string;
};

const getMySchedule = async () => {
  const token = await authCode.get();
  if (!token) return null;
  const res = await fetchInstance(true).get("/api/party/my-parties");
  const now = new Date();
  const sorted = res.data
    .map((party: Party) => ({
      id: party.id,
      departure: party.startPlace.name,
      destination: party.endPlace.name,
      startDateTime: parseISO(party.startDateTime),
    }))
    .filter((p) => isAfter(p.startDateTime, now))
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
  return sorted[0] || null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChanged, setAuthChanged] = useState(0);
  // 🟢 추가: 로그인 상태 확인이 완료될 때까지 로딩 상태를 표시합니다.
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 로그인 상태 체크
  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const token = await authCode.get();
        setIsLoggedIn(!!token);
        setAuthChanged((prev) => prev + 1);
        // 🟢 추가: 토큰 확인 완료 후 로딩 해제
        setIsAuthChecking(false);
      };
      checkToken();
    }, []),
  );

  const { data: schedule, isFetching } = useQuery({
    queryKey: ["mySchedule", authChanged],
    queryFn: getMySchedule,
    enabled: isLoggedIn,
  });

  const formatScheduleDateTime = (date: Date) => {
    const dateLabel = isToday(date) ? "오늘" : format(date, "MM-dd");
    const timeLabel = format(date, "HH:mm");
    return `${dateLabel} ${timeLabel}에 예정되어 있습니다.`;
  };

  const handleSchedulePress = () => {
    // 비로그인 상태면 로그인 페이지로 즉시 라우팅
    if (!isLoggedIn) {
      router.push("/signin");
    }
    // 로그인 상태이고 스케줄이 있으면 채팅 목록으로 라우팅
    else if (schedule) {
      router.push("/chat_list");
    }
  };

  // 🟢 로딩 중일 때는 아무것도 렌더링하지 않거나 로딩 인디케이터를 보여줄 수 있습니다.
  // 여기서는 단순히 컴포넌트 전체를 비활성화하지 않고 내용을 보여주도록 합니다.
  if (isAuthChecking) {
    // 토큰 확인 중일 때 화면이 잠깐 깜빡이는 것을 막기 위해 최소한의 UI를 보여줄 수 있습니다.
    // 하지만 현재는 로딩 상태를 명확히 보여주는 코드가 없으므로,
    // 로딩 중에도 UI를 렌더링하고 상호작용만 막는 방식으로 처리합니다.
  }

  return (
    <Container>
      {/* 🔴 수정: 비로그인일 때도 onPress가 동작하도록 disabled={!schedule}를 제거합니다. */}
      {/* 🔴 수정: 대신 isAuthChecking 중에는 disabled를 true로 설정하여 오작동을 막습니다. */}
      <ScheduleBox
        onPress={handleSchedulePress}
        disabled={isAuthChecking || (isLoggedIn && !schedule)}
      >
        {isAuthChecking ? (
          <BoxText>인증 정보를 확인 중입니다...</BoxText>
        ) : !isLoggedIn ? (
          <BoxText>로그인 후 이용해 주세요!</BoxText>
        ) : isFetching ? (
          <BoxText>불러오는 중...</BoxText>
        ) : !schedule ? (
          <BoxText>현재 카풀 일정이 없습니다!</BoxText>
        ) : (
          <>
            <BoxText>
              {schedule.departure} &gt; {schedule.destination}
            </BoxText>
            <BoxText>{formatScheduleDateTime(schedule.startDateTime)}</BoxText>
          </>
        )}
      </ScheduleBox>

      <PartyBox source={partyMakeImage}>
        <OverlayTouchable
          onPress={() => (isLoggedIn ? router.push("/carpool/recruit") : router.push("/signin"))}
          disabled={isAuthChecking} // 🟢 로딩 중 비활성화
        >
          <IconContainer>
            <Feather name="plus" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 생성하기</BoxText>
          <BoxSmallText>직접 카풀을 만들어보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>

      <PartyBox source={partyJoinImage}>
        <OverlayTouchable
          onPress={() => (isLoggedIn ? router.push("/carpool/join") : router.push("/signin"))}
          disabled={isAuthChecking} // 🟢 로딩 중 비활성화
        >
          <IconContainer>
            <Ionicons name="search" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 참여하기</BoxText>
          <BoxSmallText>다른 카풀에 참여 해보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>
    </Container>
  );
}

// ... (스타일 컴포넌트는 변경 없음)

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
});

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
  imageStyle: { borderRadius: 40, opacity: 0.5 },
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

const IconContainer = styled.View({ marginBottom: 4 });

const BoxText = styled.Text({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333333",
  textAlign: "center",
});

const BoxSmallText = styled.Text({
  fontSize: 12,
  color: "#333333",
  textAlign: "center",
});
