import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import styled from "styled-components/native";

import { ColContainer, RowContainer } from "@/entities/carpool/components/containers";
import CustomModal from "@/entities/carpool/components/custom_modal";
import PartySetting from "@/entities/carpool/components/party_setting";
import { formatOptions, optionsList } from "@/entities/carpool/format_options";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import CircleButton from "@/entities/common/components/button_circle";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { Colors } from "@/entities/common/util/style_var";

export default function Recruit() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const maxMembers = usePartyStore((state) => state.maxMembers);
  const comment = usePartyStore((state) => state.comment);
  const options = usePartyStore((state) => state.options);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  return (
    <Container>
      <PartySetting />
      <ColContainer>
        <RowContainer>
          <Label title="최대 참여 인원" />
          <TextInput
            keyboardType="numeric"
            value={String(maxMembers)}
            onChangeText={(v) => setPartyState({ maxMembers: Number(v) })}
          />
        </RowContainer>
      </ColContainer>
      <ExtraSetting
        title="추가 옵션"
        children={
          <RowContainer>
            <Text>{formatOptions(options)}</Text>
            <OptionButton onPress={() => setModalVisible(true)}>
              <Text>추가하기</Text>
              <IconSymbol name="plus.circle" color={Colors.main} />
            </OptionButton>
          </RowContainer>
        }
      />
      <CustomModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
        <Text>추가 옵션 선택</Text>
        {optionsList.map((option) => (
          <View>
            <Checkbox
              key={option.name}
              value={options[option.name]}
              onValueChange={(v) => setPartyState({ options: { ...options, [option.name]: v } })}
            />
            <Text>{option.ko}</Text>
          </View>
        ))}
      </CustomModal>
      <ExtraSetting
        title="comment"
        children={
          <TextInput
            placeholder={`추가적인 안내사항,
하고 싶은 말(20자 이내)`}
            value={comment}
            onChangeText={(v) => setPartyState({ comment: v })}
          />
        }
      />
      <CircleButton
        icon="checkmark"
        onPress={() => {
          setPartyState({ partyId: undefined });
          router.push("/carpool/recheck");
        }}
      />
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
});

const OptionButton = styled.Pressable({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
  color: Colors.main,
  border: `1.5px dashed ${Colors.main}`,
  padding: "3px 8px 3px 15px",
  borderRadius: "30px",
});

const ExtraSetting = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <ExtraSettingContainer>
      <Text>{title}</Text>
      {children}
    </ExtraSettingContainer>
  );
};

const ExtraSettingContainer = styled.View({
  padding: "10px",
  borderRadius: "24px",
});
