import { create } from "zustand";

import { Party } from "../types";

interface storeThings {
  setPartyState: (newState: Partial<Party | Pick<storeThings, "isHandOveredData">>) => void;

  isHandOveredData: boolean;
  clearExceptId: () => void;

  /* 🔴 [추가] 알림 기반 채팅 이동용 */
  pendingChatRoomId: number | null;
  setPendingChatRoomId: (id: number) => void;
  clearPendingChatRoomId: () => void;
}

const usePartyStore = create<Party & storeThings>((set) => ({
  /* ===== 기존 Party 상태 ===== */
  partyId: undefined,
  when2go: undefined,
  departure: undefined,
  destination: undefined,
  maxMembers: 4,
  curMembers: 1,
  estimatedFare: 0,
  comment: "",
  options: {
    sameGenderOnly: false,
    costShareBeforeDropOff: false,
    quietMode: false,
    destinationChangeIn5Minutes: false,
  },

  /* ===== 기존 메서드 ===== */
  setPartyState: (newState) => set(() => ({ ...newState })),

  isHandOveredData: false,

  clearExceptId: () =>
    set((state) => ({
      partyId: state.partyId,
      when2go: undefined,
      departure: undefined,
      destination: undefined,
      maxMembers: 4,
      curMembers: 1,
      comment: "",
      options: {
        sameGenderOnly: false,
        costShareBeforeDropOff: false,
        quietMode: false,
        destinationChangeIn5Minutes: false,
      },
      isHandOveredData: false,
    })),

  /* ===== 🔴 알림 전용 상태 (기존 로직과 완전 분리) ===== */
  pendingChatRoomId: null,

  setPendingChatRoomId: (id: number) => set({ pendingChatRoomId: id }),

  clearPendingChatRoomId: () => set({ pendingChatRoomId: null }),
}));

export default usePartyStore;
