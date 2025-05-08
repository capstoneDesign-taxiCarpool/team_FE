import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import styled from "styled-components/native";

import CustomModal from "@/entities/carpool/components/custom_modal";
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
      <CustomModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
        <View>
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
        </View>
      </CustomModal>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});
