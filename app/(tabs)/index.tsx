import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  parseISO,
} from "date-fns";
import { setBadgeCountAsync } from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, // 링크 열기 오류 시 사용
  ImageBackground,
  Linking, // 외부 링크 열기에 사용
  Modal, // 모달 컴포넌트 사용
  Text, // 모달 내 텍스트에 사용
  TouchableOpacity, // 버튼에 사용
  View, // 버튼 컨테이너에 사용
} from "react-native";
import styled from "styled-components/native";

import { ColContainer } from "@/entities/common/components/containers";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";
import { Colors } from "@/entities/common/util/style_var";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

const REPORT_URL = "https://naver.me/ximjhzzM";
const SUGGESTION_URL = "https://naver.me/57QAljUM";

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
    .filter((p: { startDateTime: Date }) => isAfter(p.startDateTime, now))
    .sort(
      (a: { startDateTime: Date }, b: { startDateTime: Date }) =>
        a.startDateTime.getTime() - b.startDateTime.getTime(),
    );
  return sorted[0] || null;
};

// -------------------------------------------------------------
// 🟢 신고/건의 버튼 스타일
// -------------------------------------------------------------
const ReportOrSuggestButton = styled(TouchableOpacity)({
  position: "absolute",
  bottom: 15,
  right: 15,
  backgroundColor: "#e74c3c",
  borderRadius: 20,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
  borderWidth: 2,
  borderColor: "#fff",
});

const ReportModalButton = styled(TouchableOpacity)<{ bgColor?: string }>(({ bgColor }) => ({
  width: "100%",
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: bgColor || "#3498db",
  justifyContent: "center",
  alignItems: "center",
}));

const ReportModalButtonText = styled(Text)({
  fontSize: 16,
  fontWeight: "bold",
  color: "#fff",
});

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChanged, setAuthChanged] = useState(0);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  // 🟢 추가: 신고/건의 모달 상태
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  // 로그인 상태 체크
  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const token = await authCode.get();
        setIsLoggedIn(!!token);
        setAuthChanged((prev) => prev + 1);
        setIsAuthChecking(false);
      };
      checkToken();
    }, []),
  );

  useEffect(() => {
    setBadgeCountAsync(0);
  }, []);

  const { data: schedule, isFetching } = useQuery({
    queryKey: ["mySchedule", authChanged],
    queryFn: getMySchedule,
    enabled: isLoggedIn,
  });

  const formatScheduleDateTime = (date: Date) => {
    const now = new Date();
    const dateDiff = differenceInDays(date, now);
    const hours = differenceInHours(date, now) % 24;
    const minutes = differenceInMinutes(date, now) % 60;
    return `${dateDiff}일 ${hours}시간 ${minutes}분`;
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

  // 🟢 신고/건의 모달 열기 함수
  const openReportModal = () => {
    setIsReportModalVisible(true);
  };

  // 🟢 외부 링크 열기 핸들러
  const handleOpenLink = async (url: string) => {
    setIsReportModalVisible(false); // 모달 닫기
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`⚠️ 오류`, `링크를 열 수 없습니다: ${url}`);
    }
  };

  return (
    <>
      <TopContainer />
      <ColContainer
        style={{ padding: 16, alignItems: "stretch", justifyContent: "center", flex: 1 }}
      >
        <ReportOrSuggestButton onPress={openReportModal}>
          <Ionicons name="alert-circle" size={24} color="#fff" />
        </ReportOrSuggestButton>

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
              <ColoedBoxText color={Colors.main}>
                {schedule.departure} &gt; {schedule.destination}
              </ColoedBoxText>
              <ColoedBoxText color={Colors.side}>
                {formatScheduleDateTime(schedule.startDateTime)}
                <BoxText> 후에 출발합니다!</BoxText>
              </ColoedBoxText>
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

        {/* 🟢 신고/건의 모달 렌더링 */}
        <Modal
          visible={isReportModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsReportModalVisible(false)}
        >
          <ModalOverlay>
            <ModalContainer>
              <ModalTitle>신고 및 건의</ModalTitle>
              <Text style={{ textAlign: "center", marginBottom: 15, color: "#666" }}>
                해당 버튼을 누르면 외부 폼으로 이동합니다.
              </Text>

              <ReportModalButton bgColor="#e74c3c" onPress={() => handleOpenLink(REPORT_URL)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="megaphone" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <ReportModalButtonText>신고하기</ReportModalButtonText>
                </View>
              </ReportModalButton>

              <ReportModalButton bgColor="#2ecc71" onPress={() => handleOpenLink(SUGGESTION_URL)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="chatbox-ellipses"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <ReportModalButtonText>건의하기</ReportModalButtonText>
                </View>
              </ReportModalButton>

              <ReportModalButton bgColor="#aaa" onPress={() => setIsReportModalVisible(false)}>
                <ReportModalButtonText>닫기</ReportModalButtonText>
              </ReportModalButton>
            </ModalContainer>
          </ModalOverlay>
        </Modal>
      </ColContainer>
    </>
  );
}

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

const ScheduleBox = styled.TouchableOpacity({
  backgroundColor: Colors.white,
  display: "flex",
  justifyContent: "start",
  alignItems: "center",
  marginBottom: 16,
  borderRadius: 50,
  padding: "20px",
});
const TopContainer = styled.View({
  position: "absolute",
  height: "77%",
  width: "180%",
  borderRadius: 300,
  top: "-53%",
  left: "-40%",
  backgroundColor: "rgba(36, 51, 148, 0.3)",
});

const PartyBox = styled(ImageBackground).attrs({
  imageStyle: { borderRadius: 40, opacity: 0.5 },
})({
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
const ColoedBoxText = styled.Text<{ color: string }>(({ color }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: color,
  textAlign: "center",
}));

const BoxSmallText = styled.Text({
  fontSize: 12,
  color: "#333333",
  textAlign: "center",
});
