import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable } from "react-native";
import styled from "styled-components/native";

import CustomModal from "@/entities/carpool/components/custom_modal";
import MapWithMarker from "@/entities/carpool/components/map_with_marker";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { Party } from "@/entities/carpool/types";
import BasicButton from "@/entities/common/components/button_basic";
import { RowContainer } from "@/entities/common/components/containers";
import PartyCard from "@/entities/common/components/party_card";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

const joinParty = async (partyId: number, onSuccess: () => void) =>
  fetchInstance(true)
    .post(`/api/party/${partyId}/join?`)
    .then(onSuccess)
    .catch((err) => {
      Alert.alert("카풀 참여 실패", err.response.data.message ?? "서버 오류");
    });

const formatDate = (date: number) =>
  new Date(
    new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000 + 32400000,
  ).toISOString();
interface CreateParty extends Omit<Party, "partyId"> {
  setPartyState: (state: Partial<Party>) => void;
  onSuccess: () => void;
}
const createParty = async ({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  comment,
  setPartyState,
  onSuccess,
}: CreateParty) => {
  if (!when2go || !departure || !destination) {
    Alert.alert(
      "카풀 생성 실패",
      `${when2go ? "" : "출발시간 "} ${departure ? "" : "출발지 "} ${destination ? "" : "도착지 "}를 입력해주세요`,
    );
    return;
  }

  fetchInstance(true)
    .post("/api/party", {
      sameGenderOnly: options.sameGenderOnly,
      costShareBeforeDropOff: options.costShareBeforeDropOff,
      quietMode: options.quietMode,
      destinationChangeIn5Minutes: options.destinationChangeIn5Minutes,
      startDateTime: formatDate(when2go),
      maxParticipantCount: maxMembers,
      currentParticipantCount: curMembers,
      startPlace: departure,
      endPlace: destination,
      comment,
    })
    .then((res) => {
      setPartyState({
        partyId: res.data.id,
      });
      onSuccess();
    })
    .catch((err) => {
      Alert.alert(
        "카풀 생성 실패",
        Object.values(err.response.data.errors).join("\n") ?? "서버 오류",
      );
    });
};

export default function Recheck() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const partyId = usePartyStore((state) => state.partyId);
  const when2go = usePartyStore((state) => state.when2go);
  const departure = usePartyStore((state) => state.departure);
  const destination = usePartyStore((state) => state.destination);
  const maxMembers = usePartyStore((state) => state.maxMembers);
  const curMembers = usePartyStore((state) => state.curMembers);
  const options = usePartyStore((state) => state.options);
  const comment = usePartyStore((state) => state.comment);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  return (
    <Container>
      <PartyCard
        when2go={when2go}
        departure={departure}
        destination={destination}
        maxMembers={maxMembers}
        curMembers={curMembers}
        options={options}
        comment={comment}
        buttons={
          <BasicButton
            title={partyId ? "참여하기" : "생성하기"}
            icon={partyId ? "bubble.left.fill" : "plus.circle"}
            onPress={() => setModalVisible(true)}
            isToRight={true}
          />
        }
      />
      <MapWithMarker departure={departure} destination={destination} />
      <CustomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title={`카풀${partyId ? "에 참여" : "을 생성"}할까요?`}
      >
        <RowContainer>
          <Pressable onPress={() => setModalVisible(false)}>
            <ModalBtnText color={Colors.side}>취소</ModalBtnText>
          </Pressable>
          <Pressable
            aria-label={`카풀${partyId ? " 참여" : " 생성"} 버튼`}
            onPress={() => {
              setModalVisible(!modalVisible);
              if (partyId) {
                joinParty(partyId, () => router.push("/(tabs)/chat_list"));
              } else {
                createParty({
                  when2go,
                  departure,
                  destination,
                  maxMembers,
                  curMembers,
                  options,
                  comment,
                  setPartyState,
                  onSuccess: () => router.push("/(tabs)/chat_list"),
                });
              }
            }}
          >
            <ModalBtnText>{partyId ? "참여하기" : "생성하기"}</ModalBtnText>
          </Pressable>
        </RowContainer>
      </CustomModal>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});
const ModalBtnText = styled.Text<{ color?: string }>((props) => ({
  color: props.color || Colors.black,
  padding: "5px 10px",
  fontSize: FontSizes.medium,
}));
