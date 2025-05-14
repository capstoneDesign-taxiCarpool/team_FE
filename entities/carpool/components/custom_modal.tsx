import { Modal } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "@/entities/common/util/style_var";

export default function CustomModal({
  modalVisible,
  setModalVisible,
  title,
  children,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
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
          {title && <ModalTitle>{title}</ModalTitle>}
          {children}
        </ModalContainer>
      </ModalBack>
    </Modal>
  );
}
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
});
const ModalTitle = styled.Text({
  fontSize: FontSizes.small,
  fontWeight: "bold",
  paddingBottom: 5,
  marginBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ccc",
  color: Colors.main,
  textAlign: "center",
});
