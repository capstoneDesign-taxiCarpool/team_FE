import { Alert } from "react-native";

import { fetchInstance } from "../common/util/axios_instance";
import { Party } from "./types";

export const joinParty = async (partyId: number, onSuccess: () => void) =>
  fetchInstance(true)
    .post(`/api/party/${partyId}/join?`)
    .then(onSuccess)
    .catch((err) => {
      Alert.alert("카풀 참여 실패", err.response.data.message ?? "서버 오류");
    });

export const deleteParty = (partyId: number, onSuccess: () => void) =>
  fetchInstance(true)
    .delete(`/api/party/${partyId}`)
    .then(() => {
      Alert.alert("카풀 삭제 성공", "카풀이 삭제되었습니다.");
      onSuccess();
    })
    .catch((err) => {
      Alert.alert("카풀 삭제 실패", err.response.data.message ?? "서버 오류");
    });

const formatDate = (date: number) =>
  new Date(
    new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000 + 32400000,
  ).toISOString();

interface MakePartyProps extends Omit<Party, "partyId"> {
  mode: "create" | "edit";
  partyId?: number;
  setPartyState: (state: Partial<Party>) => void;
  onSuccess: () => void;
}
const makeParty = async ({
  mode,
  partyId,
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  comment,
  setPartyState,
  onSuccess,
}: MakePartyProps) => {
  if (!when2go || !departure || !destination) {
    Alert.alert(
      `카풀 ${mode === "create" ? "생성" : "수정"} 실패`,
      `${when2go ? "" : "출발시간 "} ${departure ? "" : "출발지 "} ${destination ? "" : "도착지 "}를 입력해주세요`,
    );
    return;
  }

  fetchInstance(true)
    [mode === "create" ? "post" : "put"](
      mode === "create" ? "/api/party" : `/api/party/${partyId}`,
      {
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
      },
    )
    .then((res) => {
      setPartyState({
        partyId: res.data.id,
      });
      onSuccess();
    })
    .catch((err) => {
      Alert.alert(
        `카풀 ${mode === "create" ? "생성" : "수정"} 실패`,
        Object.values(err.response.data.errors).join("\n") ?? "서버 오류",
      );
    });
};
export const createParty = async ({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  comment,
  setPartyState,
  onSuccess,
}: Omit<MakePartyProps, "mode">) =>
  makeParty({
    mode: "create",
    when2go,
    departure,
    destination,
    maxMembers,
    curMembers,
    options,
    comment,
    setPartyState,
    onSuccess,
  });
export const editParty = async ({
  partyId,
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  comment,
  setPartyState,
  onSuccess,
}: Omit<MakePartyProps, "mode">) =>
  makeParty({
    mode: "edit",
    partyId,
    when2go,
    departure,
    destination,
    maxMembers,
    curMembers,
    options,
    comment,
    setPartyState,
    onSuccess,
  });
