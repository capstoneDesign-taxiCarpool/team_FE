import { create } from "zustand";

import { Party } from "../types";

interface storeThings {
  setPartyState: (newState: Partial<Party | Pick<storeThings, "isHandOveredData">>) => void;
  isHandOveredData: boolean;
  clearExceptId: () => void;
}

const usePartyStore = create<Party & storeThings>((set) => ({
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
}));

export default usePartyStore;
