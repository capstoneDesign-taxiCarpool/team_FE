import { create } from "zustand";

import { Party } from "../types";

interface setState {
  setPartyState: (newState: Partial<Party>) => void;
}

const usePartyStore = create<Party & setState>((set) => ({
  partyId: null,
  when2go: null,
  departure: null,
  destination: null,
  maxMembers: 1,
  curMembers: 1,
  comment: "",
  options: [],
  setPartyState: (newState: Partial<Party>) => set(() => ({ ...newState })),
}));

export default usePartyStore;
