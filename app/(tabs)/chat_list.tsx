import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, Text } from "react-native";
import styled from "styled-components/native";

import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { PartyResponse } from "@/entities/carpool/types";
import BasicButton from "@/entities/common/components/button_basic";
import { RowContainer } from "@/entities/common/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import PartyCard from "@/entities/common/components/party_card";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

const getTestData = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const result: PartyResponse[] = [
    // Today
    {
      id: 1,
      sameGenderOnly: true,
      costShareBeforeDropOff: false,
      quietMode: false,
      destinationChangeIn5Minutes: true,
      startDateTime: today.getTime(),
      comment: "오늘 첫 번째 파티",
      currentParticipantCount: 3,
      maxParticipantCount: 5,
      startPlace: { name: "출발지1", x: 127.0, y: 37.0 },
      endPlace: { name: "도착지1", x: 128.0, y: 38.0 },
    },
    {
      id: 2,
      sameGenderOnly: false,
      costShareBeforeDropOff: true,
      quietMode: true,
      destinationChangeIn5Minutes: false,
      startDateTime: today.getTime(),
      comment: "오늘 두 번째 파티",
      currentParticipantCount: 2,
      maxParticipantCount: 4,
      startPlace: { name: "출발지2", x: 127.1, y: 37.1 },
      endPlace: { name: "도착지2", x: 128.1, y: 38.1 },
    },
    // Tomorrow
    {
      id: 3,
      sameGenderOnly: true,
      costShareBeforeDropOff: false,
      quietMode: false,
      destinationChangeIn5Minutes: true,
      startDateTime: tomorrow.getTime(),
      comment: "내일 첫 번째 파티",
      currentParticipantCount: 4,
      maxParticipantCount: 6,
      startPlace: { name: "출발지3", x: 127.2, y: 37.2 },
      endPlace: { name: "도착지3", x: 128.2, y: 38.2 },
    },
    {
      id: 4,
      sameGenderOnly: false,
      costShareBeforeDropOff: true,
      quietMode: true,
      destinationChangeIn5Minutes: false,
      startDateTime: tomorrow.getTime(),
      comment: "내일 두 번째 파티",
      currentParticipantCount: 3,
      maxParticipantCount: 5,
      startPlace: { name: "출발지4", x: 127.3, y: 37.3 },
      endPlace: { name: "도착지4", x: 128.3, y: 38.3 },
    },
    {
      id: 5,
      sameGenderOnly: true,
      costShareBeforeDropOff: false,
      quietMode: false,
      destinationChangeIn5Minutes: true,
      startDateTime: tomorrow.getTime(),
      comment: "내일 세 번째 파티",
      currentParticipantCount: 2,
      maxParticipantCount: 4,
      startPlace: { name: "출발지5", x: 127.4, y: 37.4 },
      endPlace: { name: "도착지5", x: 128.4, y: 38.4 },
    },
    // Day after tomorrow
    {
      id: 6,
      sameGenderOnly: false,
      costShareBeforeDropOff: true,
      quietMode: true,
      destinationChangeIn5Minutes: false,
      startDateTime: dayAfterTomorrow.getTime(),
      comment: "모레 첫 번째 파티",
      currentParticipantCount: 1,
      maxParticipantCount: 3,
      startPlace: { name: "출발지6", x: 127.5, y: 37.5 },
      endPlace: { name: "도착지6", x: 128.5, y: 38.5 },
    },
  ];
  return result;
};

const fetchChatList = async (): Promise<PartyResponse[]> => {
  try {
    await fetchInstance(true).get<PartyResponse[]>("/api/party/my-parties");
    return await getTestData();
  } catch (err) {
    console.error(err);
    return [];
  }
};

const groupByDate = (parties: PartyResponse[]) => {
  return parties.reduce(
    (acc, party) => {
      const date = format(new Date(party.startDateTime), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
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
        borderRadius: 30,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function ChatList() {
  const { isLoading, data: chatRooms } = useQuery<PartyResponse[]>({
    queryKey: ["chatList"],
    queryFn: fetchChatList,
  });
  const partyId = usePartyStore((state) => state.partyId);
  const scrollViewRef = useRef<ScrollView>(null);

  const groupedChatRooms = chatRooms ? groupByDate(chatRooms) : {};

  useEffect(() => {
    // 현재 페이지로 이동했을 때 partyId에 해당하는 카드로 스크롤
    if (chatRooms && partyId) {
      const targetIndex = chatRooms.findIndex((party) => party.id === partyId);
      if (targetIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: targetIndex * 180, // 각 카드의 높이 대략 160px
          animated: true,
        });
      }
    }
  }, [chatRooms, partyId]);

  return (
    <Container ref={scrollViewRef}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : chatRooms && chatRooms.length > 0 ? (
        Object.entries(groupedChatRooms).map(([date, parties]) => (
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
                    <RowContainer justifyContent="flex-end">
                      <BasicButton
                        icon="gearshape"
                        title="설정 변경"
                        onPress={() => {}}
                        color={Colors.main}
                      />
                      <BasicButton icon="bubble.left.fill" title="채팅" onPress={() => {}} />
                    </RowContainer>
                  }
                />
              </HighlightedCard>
            ))}
          </DateGroup>
        ))
      ) : (
        <EmptyState>
          <Text>참여 중인 카풀이 없습니다.</Text>
        </EmptyState>
      )}
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
