import { create } from "zustand";
import { IBasePacket } from "../../types";
import { devtools } from "zustand/middleware";

export interface AnalyzerState {
  hasLog: boolean;
  data: IBasePacket[];
  selectedPacket: number | null;
  mapping: "yarn" | "mojang" | "intermediary";
  logTitle: string;

  setHasLog: (hasLog: boolean) => void;
  setData: (data: IBasePacket[]) => void;
  setSelectedPacket: (selectedPacket: number | null) => void;
  setMapping: (mapping: "yarn" | "mojang" | "intermediary") => void;
  setLogTitle: (logTitle: string) => void;
}

export const useAnalyzerData = create<AnalyzerState>()(
  devtools(
    (set, get) => ({
      hasLog: false,
      data: [],
      selectedPacket: null,
      mapping: "yarn",
      logTitle: "",
      setHasLog: (hasLog) => set({ hasLog }),
      setData: (data) => set({ data }),
      setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
      setMapping: (mapping) => set({ mapping }),
      setLogTitle: (logTitle) => set({ logTitle }),
    })
  )
);