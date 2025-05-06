import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text } from "react-native";
import styled from "styled-components/native";

import MapWithMarker from "@/entities/carpool/components/map_with_marker";
import PartyCard from "@/entities/carpool/components/party_card";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import BasicButton from "@/entities/common/components/button_basic";
import { fetchInstance } from "@/entities/common/util/axios_instance";

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
        buttons={
          <BasicButton
            title={partyId ? "참여하기" : "생성하기"}
            icon={partyId ? "bubble.left.fill" : "plus.circle"}
            onPress={() => setModalVisible(true)}
          />
        }
      />
      <MapWithMarker departure={departure} destination={destination} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ModalBack onPress={() => setModalVisible(false)}>
          <ModalContainer>
            <Text>카풀{partyId ? "에 참여" : "을 생성"}할까요?</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text>취소</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible);
                if (partyId) {
                  fetchInstance()
                    .post(`/api/party/${partyId}/join?`)
                    .then(() => router.push("/(tabs)/chat_list"))
                    .catch((err) => {
                      // TODO 에러 처리 + 서버 데이터 리패치
                      console.error(err);
                      router.push("/(tabs)/chat_list");
                    });
                } else {
                  fetchInstance()
                    .post("/api/party", {
                      when2go,
                      departure,
                      destination,
                      maxMembers,
                      curMembers,
                      options,
                    })
                    .then((res) => {
                      setPartyState({
                        partyId: res.data.id,
                      });
                      router.push("/(tabs)/chat_list");
                    })
                    .catch((err) => {
                      // TODO 에러 처리
                      console.error(err);
                      router.push("/(tabs)/chat_list");
                    });
                }
              }}
            >
              <Text>{partyId ? "참여하기" : "생성하기"}</Text>
            </Pressable>
          </ModalContainer>
        </ModalBack>
      </Modal>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});

const ModalBack = styled.Pressable({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});
const ModalContainer = styled.View({
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 20,
  justifyContent: "center",
  alignItems: "center",
});
