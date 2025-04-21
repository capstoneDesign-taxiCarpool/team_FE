import { create } from "zustand";

export interface Party {
  partyId: number | null;
  when2go: number | null;
  departure: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  destination: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  maxMembers: number;
  curMembers: number;
  options: ("NO_TALKING" | "SAME_SEX" | "PAY_IN_TAXI")[];
}
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
  options: [],
  setPartyState: (newState: Partial<Party>) => set(() => ({ ...newState })),
}));

export default usePartyStore;
