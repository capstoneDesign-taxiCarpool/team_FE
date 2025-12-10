import { Client } from "@stomp/stompjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import styled from "styled-components/native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { mapRawParty, PartyResponse, RawPartyResponse } from "@/entities/carpool/types";
import BasicButton from "@/entities/common/components/button_basic";
import { RowContainer } from "@/entities/common/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import PartyCard from "@/entities/common/components/party_card";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
  return typeof err === "object" && err !== null && "response" in err;
};

const mapRawPartyWithSavings = (raw: RawPartyResponse): PartyResponse => ({
  ...mapRawParty(raw),
  savingsCalculated: raw.savingsCalculated ?? false,
});

const fetchChatList = async (): Promise<PartyResponse[]> => {
  try {
    const res = await fetchInstance(true).get<RawPartyResponse[]>("/api/party/my-parties");
    return res.data.map(mapRawPartyWithSavings);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const groupByDate = (parties: PartyResponse[]) =>
  parties.reduce((acc: Record<string, PartyResponse[]>, party) => {
    const date = format(new Date(party.startDateTime), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(party);
    return acc;
  }, {});

export default function ChatList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);

  const { isLoading, data: chatRoomsData } = useQuery({
    queryKey: ["parties", "my"],
    queryFn: fetchChatList,
  });

  const [chatRooms, setChatRooms] = useState<PartyResponse[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const setPartyStore = usePartyStore((state) => state.setPartyState);
  const stompClients = useRef<Record<number, Client>>({});

  useEffect(() => {
    if (chatRoomsData) setChatRooms(chatRoomsData);
  }, [chatRoomsData]);

  useEffect(() => {
    fetchInstance(true)
      .get("/api/member/me")
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(-1));
  }, []);

  const refreshChatList = () => {
    queryClient.invalidateQueries({ queryKey: ["parties", "my"] });
  };

  const unsubscribeStomp = (partyId: number) => {
    const client = stompClients.current[partyId];
    if (client && client.connected) {
      client.deactivate();
      delete stompClients.current[partyId];
    }
  };

  const handleLeave = (party: PartyResponse) => {
    Alert.alert("⚠️ 퇴장 확인", "정말 퇴장하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "퇴장",
        style: "destructive",
        onPress: async () => {
          try {
            await fetchInstance(true).post(`/api/party/${party.id}/leave`, { preventFcm: true });

            unsubscribeStomp(party.id);

            Alert.alert("완료", "정상적으로 퇴장했습니다.");
            refreshChatList();
          } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : "알 수 없는 오류";

            Alert.alert("오류", message ?? "알 수 없는 오류");
          }
        },
      },
    ]);
  };

  const handleComplete = (party: PartyResponse) => {
    Alert.alert("카풀 완료", "해당 카풀을 완료 처리하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "완료",
        style: "destructive",
        onPress: async () => {
          try {
            await fetchInstance(true).post(`/api/party/${party.id}/savings`);

            Alert.alert("완료", "카풀이 정상적으로 완료되었습니다.");
            refreshChatList();
          } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : "알 수 없는 오류";

            Alert.alert("오류", message ?? "알 수 없는 오류");
          }
        },
      },
    ]);
  };

  if ((userId ?? -1) < 0 || isLoading || chatRooms.length === 0) {
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

  const groupedChatRooms = groupByDate(chatRooms);
  const now = new Date();

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
            const start = new Date(v.startDateTime);
            const isActive = start > now;

            return (
              <PartyCard
                key={v.id}
                isActive={isActive}
                showTitle={true}
                when2go={v.startDateTime}
                departure={v.startPlace}
                destination={v.endPlace}
                maxMembers={v.maxParticipantCount}
                curMembers={v.currentParticipantCount}
                estimatedFare={v.estimatedFare}
                options={{
                  sameGenderOnly: v.sameGenderOnly,
                  costShareBeforeDropOff: v.costShareBeforeDropOff,
                  quietMode: v.quietMode,
                  destinationChangeIn5Minutes: v.destinationChangeIn5Minutes,
                }}
                buttons={
                  <RowContainer justifyContent="flex-end" gap={18}>
                    {isHost && (
                      <>
                        {now < start && (
                          <BasicButton
                            icon="settings"
                            title="설정변경"
                            color={Colors.main}
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
                          />
                        )}
                        {now >= start && !v.savingsCalculated && (
                          <BasicButton
                            icon="checkmark"
                            title="카풀완료"
                            color="#27ae60"
                            onPress={() => handleComplete(v)}
                          />
                        )}
                        <BasicButton
                          icon="arrow-back"
                          title="퇴장하기"
                          color="#e67e22"
                          onPress={() => handleLeave(v)}
                        />
                      </>
                    )}
                    {!isHost && (
                      <BasicButton
                        icon="trash"
                        title="카풀퇴장"
                        color="#e74c3c"
                        onPress={() => handleLeave(v)}
                      />
                    )}
                    <BasicButton
                      icon="chatbubble-ellipses"
                      title="채팅"
                      onPress={() => {
                        usePartyStore.setState({ partyId: v.id });
                        router.push({ pathname: "/chatpage", params: { roomId: v.id } });
                      }}
                    />
                  </RowContainer>
                }
              />
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
