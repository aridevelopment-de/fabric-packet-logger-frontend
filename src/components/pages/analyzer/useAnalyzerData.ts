import { create } from "zustand";

export interface AnalyzerState {
  hasLog: boolean;
  selectedPacket: number | null;
  mapping: "yarn" | "mojang" | "intermediary";
  logTitle: string;
  metaMinimized: boolean;

  setHasLog: (hasLog: boolean) => void;
  setSelectedPacket: (selectedPacket: number | null) => void;
  setMapping: (mapping: "yarn" | "mojang" | "intermediary") => void;
  setLogTitle: (logTitle: string) => void;
  setMetaMinimized: (metaMinimized: boolean) => void;
}

export const useAnalyzerData = create<AnalyzerState>()(
  (set, get) => ({
    hasLog: false,
    selectedPacket: null,
    mapping: "yarn",
    logTitle: "",
    metaMinimized: false,
    setHasLog: (hasLog) => set({ hasLog }),
    setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
    setMapping: (mapping) => set({ mapping }),
    setLogTitle: (logTitle) => set({ logTitle }),
    setMetaMinimized: (metaMinimized) => set({ metaMinimized }),
  })
);