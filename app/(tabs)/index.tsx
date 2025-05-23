import { Feather, Ionicons } from "@expo/vector-icons";
import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ImageBackground, Text } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

type Party = {
  id: number;
  startPlace: { name: string };
  endPlace: { name: string };
  startDateTime: string;
};

// ✅ API 요청 함수
const getMySchedule = async () => {
  try {
    const res = await fetchInstance(true).get("https://knu-carpool.store/api/party/my-parties");
    const now = new Date();

    const sorted = res.data
      .map((party: Party) => ({
        id: party.id,
        departure: party.startPlace.name,
        destination: party.endPlace.name,
        startDateTime: new Date(party.startDateTime),
      }))
      .filter((p) => p.startDateTime > now)
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    return sorted[0] || null;
  } catch (error) {
    console.error("❌ getMySchedule 에러:", error);
    return null;
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("authToken");
      console.log("🔐 SecureStore token:", token);
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, []);

  const { data: schedule, isPending } = useQuery({
    queryKey: ["mySchedule"],
    queryFn: getMySchedule,
    enabled: isLoggedIn === true,
  });

  const formatTime = (date: Date) => {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    return isToday
      ? "오늘"
      : `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleSchedulePress = () => {
    if (isLoggedIn === false) {
      router.push("/signin");
    } else if (schedule) {
      router.push(`/infocarpool/${schedule.id}`);
    }
  };
  const firebaseApp = getApp();
  const analytics = getAnalytics(firebaseApp);

  return (
    <Container>
      <ScheduleBox
        onPress={async () => {
          logEvent(analytics, "test_event", {
            screen: "Home",
            purpose: "Test event",
          });
        }}
      >
        <Text>LogTest</Text>
      </ScheduleBox>
      <ScheduleBox onPress={handleSchedulePress} activeOpacity={isLoggedIn && !schedule ? 1 : 0.7}>
        {isLoggedIn === null || isPending ? (
          <BoxText>불러오는 중...</BoxText>
        ) : !isLoggedIn || !schedule ? (
          <BoxText>현재 예정된 카풀이 없습니다</BoxText>
        ) : (
          <>
            <BoxText>
              {schedule.departure} &gt; {schedule.destination}
            </BoxText>
            <BoxText>
              {formatDateLabel(new Date(schedule.startDateTime))}{" "}
              {formatTime(new Date(schedule.startDateTime))}에 예정되어 있습니다.
            </BoxText>
          </>
        )}
      </ScheduleBox>

      <PartyBox source={partyMakeImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/recruit")}>
          <IconContainer>
            <Feather name="plus" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 생성하기</BoxText>
          <BoxSmallText>직접 카풀을 만들어보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>

      <PartyBox source={partyJoinImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/join")}>
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
  textAlign: "center",
});

const BoxSmallText = styled.Text({
  fontSize: 12,
  color: "#333333",
  textAlign: "center",
});
