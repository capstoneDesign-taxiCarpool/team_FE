import { Modal } from "react-native";
import styled from "styled-components/native";

export default function CustomModal({
  modalVisible,
  setModalVisible,
  children,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
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
        <ModalContainer>{children}</ModalContainer>
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
