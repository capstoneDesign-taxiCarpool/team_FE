import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";

import { createParty, joinParty } from "@/entities/carpool/api";
import CustomModal from "@/entities/carpool/components/custom_modal";
import MapWithMarker from "@/entities/carpool/components/map_with_marker";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import BasicButton from "@/entities/common/components/button_basic";
import { RowContainer } from "@/entities/common/components/containers";
import PartyCard from "@/entities/common/components/party_card";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

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
  const clearExceptId = usePartyStore((state) => state.clearExceptId);

  // 참여/생성 성공 시 페이지 이동만 처리
  const handleSuccess = (joinedPartyId: string) => {
    clearExceptId();
    router.push("/(tabs)/chat_list");
  };

  const handlePress = () => {
    setModalVisible(false);

    if (partyId) {
      joinParty(partyId, () => handleSuccess(partyId));
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
        onSuccess: (newPartyId) => handleSuccess(newPartyId),
      });
    }
  };

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
          <Pressable aria-label={`카풀${partyId ? " 참여" : " 생성"} 버튼`} onPress={handlePress}>
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
