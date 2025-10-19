import { Client } from "@stomp/stompjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, ScrollView, Text } from "react-native";
import styled from "styled-components/native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { mapRawParty, PartyResponse, RawPartyResponse } from "@/entities/carpool/types";
import BasicButton from "@/entities/common/components/button_basic";
import { RowContainer } from "@/entities/common/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import PartyCard from "@/entities/common/components/party_card";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

// Raw -> Party 변환
const mapRawPartyWithSavings = (raw: RawPartyResponse): PartyResponse => ({
  ...mapRawParty(raw),
  savingsCalculated: raw.savingsCalculated ?? false,
});

// 내 파티 조회
const fetchChatList = async (): Promise<PartyResponse[]> => {
  try {
    const res = await fetchInstance(true).get<RawPartyResponse[]>("/api/party/my-parties");
    return res.data.map(mapRawPartyWithSavings);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 날짜별 그룹화
const groupByDate = (parties: PartyResponse[]) =>
  parties.reduce(
    (acc, party) => {
      const date = format(new Date(party.startDateTime), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(party);
      return acc;
    },
    {} as Record<string, PartyResponse[]>,
  );

// 강조 카드 애니메이션
const HighlightedCard = ({
  isHighlighted,
  children,
}: {
  isHighlighted: boolean;
  children: React.ReactNode;
}) => {
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(borderColorAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(borderColorAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ]).start();
    }
  }, [isHighlighted, borderColorAnim]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "blue"],
  });

  return (
    <Animated.View style={{ borderColor, borderWidth: 2, borderRadius: 22 }}>
      {children}
    </Animated.View>
  );
};

export default function ChatList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading, data: chatRoomsData } = useQuery<PartyResponse[]>({
    queryKey: ["parties", "my"],
    queryFn: fetchChatList,
  });

  const [chatRooms, setChatRooms] = useState<PartyResponse[]>([]);
  const partyId = usePartyStore((state) => state.partyId);
  const [userId, setUserId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const setPartyStore = usePartyStore((state) => state.setPartyState);
  const stompClients = useRef<Record<number, Client>>({}); // roomId -> STOMP client

  const refreshChatList = () => {
    queryClient.invalidateQueries({ queryKey: ["parties", "my"] });
  };

  useEffect(() => {
    if (chatRoomsData) setChatRooms(chatRoomsData);
  }, [chatRoomsData]);

  const groupedChatRooms = chatRooms ? groupByDate(chatRooms) : {};

  // 내 정보 가져오기
  useEffect(() => {
    fetchInstance(true)
      .get("/api/member/me")
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(-1));
  }, []);

  // 특정 파티 스크롤
  useEffect(() => {
    if (chatRooms && partyId) {
      const targetIndex = chatRooms.findIndex((party) => party.id === partyId);
      if (targetIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: targetIndex * 180, animated: true });
      }
    }
  }, [chatRooms, partyId]);

  // 카풀 완료
  const handleCompleteCarpool = async (v: PartyResponse) => {
    try {
      await fetchInstance(true).post(`/api/party/${v.id}/savings`);
      setChatRooms((prev) =>
        prev.map((p) => (p.id === v.id ? { ...p, savingsCalculated: true } : p)),
      );
      setPartyStore({ isHostButtonVisible: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrLeave = async (party: PartyResponse, isHost: boolean) => {
    const now = new Date();
    const startTime = new Date(party.startDateTime);
    const startPlus1Min = new Date(startTime.getTime() + 60_000);

    // 일반 참여자가 종료된 카풀에서 삭제 버튼을 누르면 메시지 변경
    const alertMessage = isHost
      ? "정말로 파티를 삭제하시겠습니까?"
      : now >= startPlus1Min
        ? "종료된 카풀입니다. 삭제하시겠습니까?"
        : "정말로 카풀에서 퇴장하시겠습니까?";

    const actionText = isHost || now >= startPlus1Min ? "삭제" : "퇴장";

    Alert.alert(`⚠️ ${actionText}`, alertMessage, [
      { text: "취소", style: "cancel" },
      {
        text: actionText,
        style: "destructive",
        onPress: async () => {
          try {
            // FCM 알림 방지
            await fetchInstance(true).post(`/api/party/${party.id}/leave`, { preventFcm: true });

            // STOMP 구독 해제
            const client = stompClients.current[party.id];
            if (client && client.connected) {
              client.deactivate();
              delete stompClients.current[party.id];
            }

            Alert.alert(isHost ? "✅ 파티가 삭제되었습니다." : "✅ 카풀 기록이 삭제되었습니다.");
            refreshChatList();
          } catch (err) {
            console.error(err);
            Alert.alert("실패", err.response?.data?.message || "알 수 없는 오류");
          }
        },
      },
    ]);
  };

  if ((userId ?? -1) < 0 || isLoading || !chatRooms || chatRooms.length === 0) {
    return (
      <Container>
        <EmptyState>
          <Text>
            {userId === null
              ? "사용자 정보를 불러오는 중..."
              : userId === -1
                ? "로그인 후 이용해주세요."
                : "참여 중인 카풀이 없습니다."}
          </Text>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container ref={scrollViewRef} onScrollToTop={refreshChatList}>
      {Object.entries(groupedChatRooms).map(([date, parties]) => (
        <DateGroup key={date}>
          <RowContainer justifyContent="flex-start">
            <IconSymbol name="calendar" />
            <DateHeader>
              {format(new Date(date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                ? "오늘"
                : format(new Date(date), "yyyy.MM.dd")}
            </DateHeader>
          </RowContainer>

          {parties.map((v) => {
            const isHost = userId === v.hostMemberId;
            const now = new Date();
            const startTime = new Date(v.startDateTime);
            const startPlus1Min = new Date(startTime.getTime() + 60_000);

            return (
              <HighlightedCard key={v.id} isHighlighted={v.id === partyId}>
                <PartyCard
                  when2go={v.startDateTime}
                  departure={v.startPlace}
                  destination={v.endPlace}
                  maxMembers={v.maxParticipantCount}
                  curMembers={v.currentParticipantCount}
                  options={{
                    sameGenderOnly: v.sameGenderOnly,
                    costShareBeforeDropOff: v.costShareBeforeDropOff,
                    quietMode: v.quietMode,
                    destinationChangeIn5Minutes: v.destinationChangeIn5Minutes,
                  }}
                  buttons={
                    <RowContainer justifyContent="flex-end" gap={7}>
                      {isHost ? (
                        now < startTime ? (
                          <BasicButton
                            icon="gearshape"
                            title="설정 변경"
                            onPress={() => {
                              setPartyStore({
                                partyId: v.id,
                                when2go: v.startDateTime,
                                departure: v.startPlace,
                                destination: v.endPlace,
                                maxMembers: v.maxParticipantCount,
                                curMembers: v.currentParticipantCount,
                                comment: v.comment,
                                options: {
                                  sameGenderOnly: v.sameGenderOnly,
                                  costShareBeforeDropOff: v.costShareBeforeDropOff,
                                  quietMode: v.quietMode,
                                  destinationChangeIn5Minutes: v.destinationChangeIn5Minutes,
                                },
                                isHandOveredData: true,
                              });
                              router.push("/carpool/edit");
                            }}
                            color={Colors.main}
                          />
                        ) : now >= startPlus1Min ? (
                          <>
                            {!v.savingsCalculated && (
                              <BasicButton
                                icon="checkmark"
                                title="카풀 완료"
                                onPress={() => handleCompleteCarpool(v)}
                                color="#18c617"
                              />
                            )}
                            <BasicButton
                              icon="trash"
                              title="삭제하기"
                              onPress={() => handleDeleteOrLeave(v, true)}
                              color="#e74c3c"
                            />
                          </>
                        ) : null
                      ) : now < startTime ? (
                        <BasicButton
                          icon="trash"
                          title="카풀퇴장"
                          onPress={() => handleDeleteOrLeave(v, false)}
                          color="#e74c3c"
                        />
                      ) : now >= startPlus1Min ? (
                        <BasicButton
                          icon="trash"
                          title="삭제하기"
                          onPress={() => handleDeleteOrLeave(v, false)}
                          color="#e74c3c"
                        />
                      ) : null}

                      {/* 채팅 버튼 */}
                      <BasicButton
                        icon="bubble.left.fill"
                        title="채팅"
                        onPress={() => {
                          setPartyStore({ partyId: v.id });
                          router.push({
                            pathname: "/chatpage",
                            params: { roomId: v.id },
                          });
                        }}
                      />
                    </RowContainer>
                  }
                />
              </HighlightedCard>
            );
          })}
        </DateGroup>
      ))}
    </Container>
  );
}

const Container = styled(ScrollView)({
  flex: 1,
  padding: 20,
  backgroundColor: "#fff",
});

const EmptyState = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  fontSize: FontSizes.large,
});

const DateGroup = styled.View({
  marginBottom: 30,
  display: "flex",
  flexDirection: "column",
  gap: 10,
});

const DateHeader = styled.Text({
  fontSize: FontSizes.medium,
  fontWeight: "bold",
});
