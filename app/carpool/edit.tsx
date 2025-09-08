import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import styled from "styled-components/native";

import { deleteParty, editParty } from "@/entities/carpool/api";
import ExtraSetting from "@/entities/carpool/components/extra_setting";
import PartySetting from "@/entities/carpool/components/party_setting";
import useStartEndPoint from "@/entities/carpool/hooks/use_start_end_point";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import BasicButton from "@/entities/common/components/button_basic";
import CircleButton from "@/entities/common/components/button_circle";

export default function Edit() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const partyId = usePartyStore((state) => state.partyId);
  const { departure, destination } = useStartEndPoint();
  const when2go = usePartyStore((state) => state.when2go);
  const maxMembers = usePartyStore((state) => state.maxMembers);
  const curMembers = usePartyStore((state) => state.curMembers);
  const options = usePartyStore((state) => state.options);
  const comment = usePartyStore((state) => state.comment);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  const onEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["parties"] }); // parties key를 가진 애들 리프레시
    router.back();
  };
  const handleDeleteParty = () => {
    Alert.alert("정말 삭제하시겠습니까?", "삭제한 카풀은 복구할 수 없습니다.", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteParty(partyId!, onEditSuccess) },
    ]);
  };

  if (!partyId) {
    Alert.alert("오류 발생");
    router.back();
    return <Container />;
  }

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollView>
        <Container>
          <Header>{`카풀
설정 변경하기`}</Header>
          <PartySetting
            when2go={when2go}
            setWhen2go={(when2go) => setPartyState({ when2go: when2go })}
            departure={departure}
            destination={destination}
          />
          <ExtraSetting />
          <BasicButton title="삭제하기" icon="trash" isToRight={true} onPress={handleDeleteParty} />
          <CircleButton
            icon="checkmark"
            onPress={() =>
              editParty({
                partyId,
                when2go,
                departure,
                destination,
                maxMembers,
                curMembers,
                options,
                comment,
                setPartyState,
                onSuccess: onEditSuccess,
              })
            }
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Header = styled.Text({
  fontSize: 30,
  fontWeight: "bold",
  marginBottom: 20,
});

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
  margin: 20,
});
