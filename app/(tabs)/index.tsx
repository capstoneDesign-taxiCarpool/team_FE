import { Feather, Ionicons } from "@expo/vector-icons";
import notifee, { AndroidImportance } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isToday, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, PermissionsAndroid, Platform } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import partyJoinImage from "../../assets/images/partyjoin.jpg";
import partyMakeImage from "../../assets/images/partymake.jpg";

type Party = {
  id: number;
  startPlace: { name: string };
  endPlace: { name: string };
  startDateTime: string;
};

const DEVICE_ID_KEY = "my_app_device_id_v1";

async function getDeviceIdOrGenerate() {
  const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (stored) return stored;
  const newId = `generated-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  return newId;
}

async function registerFcmToken(token: string) {
  try {
    const deviceId = await getDeviceIdOrGenerate();
    const body = {
      fcmToken: token,
      platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
      deviceId,
      appVersion: "1.0.0",
      bundleOrPackage: "com.myapp",
    };
    const auth = await authCode.get();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth) headers["Authorization"] = `Bearer ${auth}`;
    await fetch("https://knu-carpool.store/api/fcm/token", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.log("❌ FCM 토큰 등록 실패", e);
  }
}

const getMySchedule = async () => {
  const token = await authCode.get();
  if (!token) return null;
  const res = await fetchInstance(true).get("/api/party/my-parties");
  const now = new Date();
  const sorted = res.data
    .map((party: Party) => ({
      id: party.id,
      departure: party.startPlace.name,
      destination: party.endPlace.name,
      startDateTime: parseISO(party.startDateTime),
    }))
    .filter((p) => isAfter(p.startDateTime, now))
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
  return sorted[0] || null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChanged, setAuthChanged] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const token = await authCode.get();
        setIsLoggedIn(!!token);
        setAuthChanged((prev) => prev + 1);
      };
      checkToken();
    }, []),
  );

  const { data: schedule, isFetching } = useQuery({
    queryKey: ["mySchedule", authChanged],
    queryFn: getMySchedule,
    enabled: isLoggedIn,
  });

  const formatScheduleDateTime = (date: Date) => {
    const dateLabel = isToday(date) ? "오늘" : format(date, "MM-dd");
    const timeLabel = format(date, "HH:mm");
    return `${dateLabel} ${timeLabel}에 예정되어 있습니다.`;
  };

  const handleSchedulePress = () => {
    if (!isLoggedIn) router.push("/signin");
    else if (schedule) router.push("/chat_list");
  };

  useEffect(() => {
    const initFCM = async () => {
      if (Platform.OS === "ios")
        await messaging().requestPermission({ alert: true, sound: true, badge: true });
      if (Platform.OS === "android" && Platform.Version >= 33)
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

      if (Platform.OS === "android") {
        await notifee.createChannel({
          id: "fcm_default_channel",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: "default",
        });
      }

      const token = await messaging().getToken();
      if (token) await registerFcmToken(token);

      messaging().onTokenRefresh(registerFcmToken);

      messaging().onMessage(async (remoteMessage) => {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || "새 메시지",
          body: remoteMessage.notification?.body || "",
          android: {
            channelId: "fcm_default_channel",
            importance: AndroidImportance.HIGH,
            smallIcon: "ic_launcher",
            autoCancel: true,
            pressAction: { id: "default" },
          },
          ios: { sound: "default" },
        });
      });
    };

    initFCM();
  }, []);

  return (
    <Container>
      <ScheduleBox onPress={handleSchedulePress} disabled={!schedule}>
        {!isLoggedIn ? (
          <BoxText>로그인 후 이용해 주세요!</BoxText>
        ) : isFetching ? (
          <BoxText>불러오는 중...</BoxText>
        ) : !schedule ? (
          <BoxText>현재 카풀 일정이 없습니다!</BoxText>
        ) : (
          <>
            <BoxText>
              {schedule.departure} &gt; {schedule.destination}
            </BoxText>
            <BoxText>{formatScheduleDateTime(schedule.startDateTime)}</BoxText>
          </>
        )}
      </ScheduleBox>

      <PartyBox source={partyMakeImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/recruit")}>
          <IconContainer>
            <Feather name="plus" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 생성하기</BoxText>
          <BoxSmallText>직접 카풀을 만들어보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>

      <PartyBox source={partyJoinImage}>
        <OverlayTouchable onPress={() => router.push("/carpool/join")}>
          <IconContainer>
            <Ionicons name="search" size={30} color="#333333" />
          </IconContainer>
          <BoxText>카풀 참여하기</BoxText>
          <BoxSmallText>다른 카풀에 참여 해보세요!</BoxSmallText>
        </OverlayTouchable>
      </PartyBox>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
});

const ScheduleBox = styled.TouchableOpacity({
  width: 400,
  height: 80,
  backgroundColor: "rgb(148, 200, 230)",
  borderRadius: 40,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

const PartyBox = styled(ImageBackground).attrs({
  imageStyle: { borderRadius: 40, opacity: 0.5 },
})({
  width: 400,
  height: 200,
  marginBottom: 16,
  overflow: "hidden",
  borderRadius: 50,
});

const OverlayTouchable = styled.TouchableOpacity({
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const IconContainer = styled.View({ marginBottom: 4 });

const BoxText = styled.Text({
  fontSize: 18,
  fontWeight: "bold",
  color: "#333333",
  textAlign: "center",
});

const BoxSmallText = styled.Text({
  fontSize: 12,
  color: "#333333",
  textAlign: "center",
});
