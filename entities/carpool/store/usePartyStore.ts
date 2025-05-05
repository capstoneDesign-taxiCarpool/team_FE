import { create } from "zustand";

import { Party } from "../types";

interface setState {
  setPartyState: (newState: Partial<Party>) => void;
}

const usePartyStore = create<Party & setState>((set) => ({
  partyId: undefined,
  when2go: undefined,
  departure: undefined,
  destination: undefined,
  maxMembers: 4,
  curMembers: 1,
  comment: "",
  options: [],
  setPartyState: (newState: Partial<Party>) => set(() => ({ ...newState })),
}));

export default usePartyStore;
