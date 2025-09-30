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

const fetchChatList = async (): Promise<PartyResponse[]> => {
  try {
    const res = await fetchInstance(true).get<RawPartyResponse[]>("/api/party/my-parties");
    return res.data.map(mapRawParty);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const groupByDate = (parties: PartyResponse[]) => {
  return parties.reduce(
    (acc, party) => {
      const date = format(new Date(party.startDateTime), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(party);
      return acc;
    },
    {} as Record<string, PartyResponse[]>,
  );
};

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
      Animated.timing(borderColorAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isHighlighted, borderColorAnim]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "blue"],
  });

  return (
    <Animated.View
      style={{
        borderColor,
        borderWidth: 2,
        borderRadius: 22,
      }}
    >
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

  useEffect(() => {
    if (chatRoomsData) setChatRooms(chatRoomsData);
  }, [chatRoomsData]);

  const groupedChatRooms = chatRooms ? groupByDate(chatRooms) : {};

  useEffect(() => {
    fetchInstance(true)
      .get("/api/member/me")
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(-1));
  }, []);

  useEffect(() => {
    if (chatRooms && partyId) {
      const targetIndex = chatRooms.findIndex((party) => party.id === partyId);
      if (targetIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: targetIndex * 180, animated: true });
      }
    }
  }, [chatRooms, partyId]);

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

  const handleCompleteCarpool = async (v: PartyResponse) => {
    try {
      await fetchInstance(true).post(`/api/party/${v.id}/savings`);
      setChatRooms((prev) =>
        prev.map((p) => (p.id === v.id ? { ...p, savingsCalculated: true } : p)),
      );
      setPartyStore({ isHostButtonVisible: false });
    } catch (err) {
      console.error(err);
      console.log("Party ID:", v.id);
    }
  };

  return (
    <Container ref={scrollViewRef}>
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

          {parties.map((v) => (
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
                    {/* // 호스트인 경우 설정 변경 또는 카풀 완료 버튼 표시 */}
                    {userId === v.hostMemberId ? (
                      new Date(v.startDateTime) > new Date() ? (
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
                      ) : (
                        !v.savingsCalculated && (
                          <BasicButton
                            icon="checkmark"
                            title="카풀 완료"
                            onPress={() => handleCompleteCarpool(v)}
                            color="#18c617"
                          />
                        )
                      )
                    ) : (
                      // 카풀 퇴장
                      <BasicButton
                        icon="trash"
                        title="카풀 퇴장"
                        onPress={() => {
                          fetchInstance(true)
                            .post(`/api/party/${v.id}/leave`)
                            .then(() => {
                              Alert.alert("카풀에서 퇴장했습니다.");
                              queryClient.invalidateQueries({ queryKey: ["parties", "my"] });
                            })
                            .catch((err) => {
                              console.error(err);
                              Alert.alert(
                                "퇴장 실패: ",
                                err.response?.data?.message || "알 수 없는 오류",
                              );
                            });
                        }}
                        color={Colors.side}
                      />
                    )}

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
          ))}
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
