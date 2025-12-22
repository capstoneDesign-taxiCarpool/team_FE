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

/* ================= util ================= */

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const isAxiosError = (err: unknown): err is AxiosErrorResponse =>
  typeof err === "object" && err !== null && "response" in err;

const mapRawPartyWithSavings = (raw: RawPartyResponse): PartyResponse => ({
  ...mapRawParty(raw),
  savingsCalculated: raw.savingsCalculated ?? false,
});

const fetchChatList = async (): Promise<PartyResponse[]> => {
  try {
    const res = await fetchInstance(true).get<RawPartyResponse[]>("/api/party/my-parties");
    return res.data.map(mapRawPartyWithSavings);
  } catch {
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

/* ================= component ================= */

export default function ChatList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["parties", "my"],
    queryFn: fetchChatList,
  });

  const [chatRooms, setChatRooms] = useState<PartyResponse[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const setPartyStore = usePartyStore((state) => state.setPartyState);
  const stompClients = useRef<Record<number, Client>>({});

  useEffect(() => {
    if (data) setChatRooms(data);
  }, [data]);

  useEffect(() => {
    fetchInstance(true)
      .get("/api/member/me")
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(-1));
  }, []);

  const refreshChatList = () => {
    queryClient.invalidateQueries({
      queryKey: ["parties", "my"],
    });
  };

  const unsubscribeStomp = (partyId: number) => {
    const client = stompClients.current[partyId];
    if (client?.connected) {
      client.deactivate();
      delete stompClients.current[partyId];
    }
  };

  /* ================= handlers ================= */

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
            refreshChatList();
          } catch (err) {
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
            refreshChatList();
          } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : "알 수 없는 오류";
            Alert.alert("오류", message ?? "알 수 없는 오류");
          }
        },
      },
    ]);
  };

  /* ================= empty ================= */

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

  const grouped = groupByDate(chatRooms);
  const now = new Date();

  /* ================= render ================= */

  return (
    <Container ref={scrollViewRef} onScrollToTop={refreshChatList}>
      {Object.entries(grouped).map(([date, parties]) => (
        <DateGroup key={date}>
          <RowContainer justifyContent="flex-start">
            {/* ✅ SF Symbol */}
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

            const buttons: JSX.Element[] = [];

            if (isHost && now < start) {
              buttons.push(
                <BasicButton
                  key="setting"
                  icon="gearshape"
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
                />,
              );
            }

            if (isHost && now >= start && !v.savingsCalculated) {
              buttons.push(
                <BasicButton
                  key="complete"
                  icon="checkmark"
                  title="카풀완료"
                  color="#27ae60"
                  onPress={() => handleComplete(v)}
                />,
              );
            }

            buttons.push(
              <BasicButton
                key="leave"
                icon="trash"
                title="카풀퇴장"
                color="#e74c3c"
                onPress={() => handleLeave(v)}
              />,
            );

            buttons.push(
              <BasicButton
                key="chat"
                icon="bubble.left.fill"
                title="채팅하기"
                onPress={() => {
                  usePartyStore.setState({
                    partyId: v.id,
                  });
                  router.push({
                    pathname: "/chatpage",
                    params: { roomId: v.id },
                  });
                }}
              />,
            );

            return (
              <PartyCard
                key={v.id}
                isActive={start > now}
                showTitle
                when2go={v.startDateTime}
                departure={v.startPlace}
                destination={v.endPlace}
                maxMembers={v.maxParticipantCount}
                hostGender={v.hostGender}
                curMembers={v.currentParticipantCount}
                estimatedFare={v.estimatedFare}
                options={{
                  sameGenderOnly: v.sameGenderOnly,
                  costShareBeforeDropOff: v.costShareBeforeDropOff,
                  quietMode: v.quietMode,
                  destinationChangeIn5Minutes: v.destinationChangeIn5Minutes,
                }}
                buttons={<FixedSlotButtons buttons={buttons} />}
              />
            );
          })}
        </DateGroup>
      ))}
    </Container>
  );
}

/* ================= 버튼 슬롯 ================= */

function FixedSlotButtons({ buttons }: { buttons: JSX.Element[] }) {
  const slots: (JSX.Element | null)[] = [null, null, null];
  const used = buttons.slice(0, 3);

  if (used.length === 1) {
    slots[2] = used[0];
  } else if (used.length === 2) {
    slots[1] = used[0];
    slots[2] = used[1];
  } else {
    slots[0] = used[0];
    slots[1] = used[1];
    slots[2] = used[2];
  }

  return (
    <ButtonRow>
      {slots.map((btn, idx) => (
        <ButtonSlot key={idx}>{btn}</ButtonSlot>
      ))}
    </ButtonRow>
  );
}

/* ================= styled ================= */

const Container = styled(ScrollView)({
  flex: 1,
  padding: 20,
  backgroundColor: "#fff",
});

const EmptyState = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const DateGroup = styled.View({
  marginBottom: 30,
  gap: 10,
});

const DateHeader = styled.Text({
  fontSize: FontSizes.medium,
  fontWeight: "bold",
});

const ButtonRow = styled.View({
  flexDirection: "row",
  width: "100%",
  marginTop: 12,
});

const ButtonSlot = styled.View({
  width: "33.333%",
  alignItems: "center",
});
