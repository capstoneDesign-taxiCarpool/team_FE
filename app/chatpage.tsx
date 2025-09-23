import { Client, IMessage } from "@stomp/stompjs";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import defaultProfile from "../assets/images/default-profile.png";

interface Message {
  id: string;
  text: string;
  isMe?: boolean;
  type?: "system" | "message";
  senderName?: string;
}

interface IncomingMessagePayload {
  id: number;
  content: string;
  senderId: number | string;
  senderNickname: string;
  createdAt: string;
  type?: string;
}

export default function ChatPage() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const stompClient = useRef<Client | null>(null);
  const myInfo = useRef<{ id: string; nickname: string }>({ id: "", nickname: "" });
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await authCode.get();
      if (!token) {
        console.error("❌ 토큰이 존재하지 않습니다.");
        return;
      }

      try {
        // 1️⃣ 사용자 정보 조회
        const res = await fetchInstance(true).get<{ id: string; nickname: string }>(
          "/api/member/me",
        );
        myInfo.current.nickname = res.data.nickname;
        myInfo.current.id = res.data.id;

        // 2️⃣ 과거 메시지 조회
        const historyRes = await fetchInstance(true).get<IncomingMessagePayload[]>(
          `/api/party/${roomId}/messages`,
        );
        const historyMessages = historyRes.data.map((msg) => ({
          id: `${msg.id}-${Date.now()}`,
          text: msg.content,
          isMe: msg.senderId.toString() === myInfo.current.id,
          senderName: msg.senderNickname,
          type:
            msg.type === "SYSTEM" || msg.type === "ENTER" || msg.type === "EXIT"
              ? "system"
              : "message",
        }));
        setMessages(historyMessages);

        // 과거 메시지 로딩 후 최하단 이동
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 50);
      } catch (error) {
        console.error("❌ 사용자 정보 또는 메시지 조회 실패:", error);
      }

      // 3️⃣ WebSocket 연결
      const wsUrl = `wss://knu-carpool.store/chat?access_token=${token}`;
      stompClient.current = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 1000000,
        heartbeatIncoming: 1000000,
        heartbeatOutgoing: 1000000,
        forceBinaryWSFrames: true,
        debug: (str: string) => console.log("📡 [DEBUG]", str),
        onConnect: () => {
          console.log("✅ STOMP CONNECT 성공");

          stompClient.current?.subscribe(`/sub/party/${roomId}`, (msg: IMessage) => {
            console.log("📩 [RECEIVED] Raw 메시지:", msg.body);
            let data: IncomingMessagePayload;
            try {
              data = JSON.parse(msg.body);
            } catch (err) {
              console.warn("⚠️ JSON 파싱 실패, 문자열 처리:", msg.body);
              data = {
                id: 0,
                content: msg.body,
                senderId: "",
                senderNickname: "알 수 없음",
                createdAt: new Date().toISOString(),
              };
            }
            console.log("📬 [PARSED] 메시지 객체:", data);
            handleIncomingMessage(data);
          });
        },
        onStompError: (frame) =>
          console.error("❌ STOMP 오류:", frame.headers["message"], frame.body),
        onWebSocketError: (evt) => console.error("❗ WebSocket 에러:", evt.message),
        onWebSocketClose: () => console.warn("🔌 WebSocket 연결 종료됨"),
        onDisconnect: () => console.log("🛑 STOMP 연결 해제"),
      });

      const originalPublish = stompClient.current.publish.bind(stompClient.current);
      stompClient.current.publish = (params) => {
        originalPublish({
          ...params,
          body: params.body + "\u0000",
        });
        console.log("📤 [RAW SEND FRAME]", {
          destination: params.destination,
          body: params.body + "\u0000",
        });
      };

      stompClient.current.activate();
    };

    connectSocket();

    return () => {
      console.log("🔻 언마운트 시 연결 종료");
      stompClient.current?.deactivate();
    };
  }, []);

  const handleIncomingMessage = (data: IncomingMessagePayload) => {
    const message: Message = {
      id: `${data.id}-${Date.now()}`,
      text: data.content,
      isMe: data.senderId.toString() === myInfo.current.id,
      senderName: data.senderNickname,
      type: data.type === "SYSTEM" ? "system" : "message",
    };
    setMessages((prev) => {
      const updated = [...prev, message];

      // 새 메시지 추가 후 최하단 이동
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      return updated;
    });
  };

  const sendMessage = () => {
    if (!inputText.trim() || !stompClient.current?.connected) return;

    const payload = {
      content: inputText,
      senderNickname: myInfo.current.nickname,
    };

    stompClient.current.publish({
      destination: `/pub/party/${roomId}/message`,
      body: JSON.stringify(payload),
    });

    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "system") {
      return (
        <SystemMessageContainer>
          <SystemText>{item.text}</SystemText>
        </SystemMessageContainer>
      );
    }
    return (
      <MessageRow isMe={item.isMe}>
        {!item.isMe && <ProfileImage source={defaultProfile} />}
        <MessageColumn isMe={item.isMe}>
          {!item.isMe && <SenderName>{item.senderName}</SenderName>}
          <MessageBubble isMe={item.isMe!}>
            <MessageText>{item.text}</MessageText>
          </MessageBubble>
        </MessageColumn>
      </MessageRow>
    );
  };

  return (
    <Container
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "android" ? 80 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <InputContainer>
        <StyledInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
        />
        <SendButton onPress={sendMessage}>
          <SendText>전송</SendText>
        </SendButton>
      </InputContainer>
    </Container>
  );
}

const Container = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: "#f2f2f2",
  padding: 16,
});

const MessageRow = styled.View<{ isMe?: boolean }>((props) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: props.isMe ? "flex-end" : "flex-start",
  marginBottom: 12,
  marginRight: props.isMe ? 5 : 0,
}));

const ProfileImage = styled(Image)({
  width: 55,
  height: 55,
  borderRadius: 22,
  marginHorizontal: 8,
});

const MessageColumn = styled.View<{ isMe?: boolean }>((props) => ({
  alignItems: props.isMe ? "flex-end" : "flex-start",
  maxWidth: "75%",
}));

const SenderName = styled.Text({
  fontSize: 12,
  color: "#888",
  marginBottom: 4,
});

const MessageBubble = styled.View<{ isMe: boolean }>((props) => ({
  backgroundColor: props.isMe ? "#aee1f9" : "#ffffff",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  maxWidth: "100%",
  borderTopLeftRadius: props.isMe ? 16 : 0,
  borderTopRightRadius: props.isMe ? 0 : 16,
}));

const MessageText = styled.Text({
  fontSize: 16,
  color: "#333333",
});

const SystemMessageContainer = styled.View({
  alignItems: "center",
  marginBottom: 12,
});

const SystemText = styled.Text({
  fontSize: 14,
  color: "#888",
  fontStyle: "italic",
});

const InputContainer = styled.View({
  flexDirection: "row",
  alignItems: "center",
  padding: 8,
  backgroundColor: "white",
  borderTopWidth: 1,
  borderTopColor: "#ddd",
  borderRadius: 30,
});

const StyledInput = styled.TextInput({
  flex: 1,
  height: 40,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 20,
  paddingHorizontal: 12,
  backgroundColor: "#fff",
});

const SendButton = styled.TouchableOpacity({
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginLeft: 8,
  backgroundColor: "#50c878",
  borderRadius: 20,
});

const SendText = styled.Text({
  color: "white",
  fontWeight: "bold",
});
