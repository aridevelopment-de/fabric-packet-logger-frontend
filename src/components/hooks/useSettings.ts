import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { IDescription } from "../types";
import ReconnectingWebSocket from "reconnecting-websocket";

// TODO: Use react router dom
export enum CurrentPage {
  LIVE_LOGGER = "Live Logger",
  ANALYZER = "Analyzer",
  INTERCEPTOR = "Interceptor",
  SEQUENCER = "Sequencer",
  COMPARER = "Comparer",
  PACKET_LIST = "Packet List",
  SETTINGS = "Settings",
}

export interface SettingsState {
  whitelistedPackets: string[];
  blacklistedPackets: string[];
  autoScroll: boolean;
  onlySaveFiltered: boolean;

  setWhitelistedPackets: (packets: string[]) => void;
  setBlacklistedPackets: (packets: string[]) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  setOnlySaveFiltered: (onlySaveFiltered: boolean) => void;
}

export interface SessionState {
  logState: "logging" | "off";
  ws: ReconnectingWebSocket | null;
  connected: boolean;
  // TODO: Make selectedPacket IBasePacket
  selectedPacket: number | null;
  registeredPackets: Array<{value: string; label: string}>;
  packetDescriptions: {[key: string]: IDescription};
  page: CurrentPage;

  setLogState: (logState: "logging" | "off") => void;
  setWs: (ws: ReconnectingWebSocket | null) => void;
  setConnected: (connected: boolean) => void;
  setSelectedPacket: (selectedPacket: number | null) => void;
  setRegisteredPackets: (registeredPackets: Array<{value: string; label: string}>) => void;
  setPacketDescriptions: (packetDescriptions: {[key: string]: IDescription}) => void;
  setPage: (page: CurrentPage) => void;
}

export const useSettings = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        whitelistedPackets: [],
        blacklistedPackets: [],
        autoScroll: true,
        onlySaveFiltered: false,
        setWhitelistedPackets: (packets) => set({ whitelistedPackets: packets }),
        setBlacklistedPackets: (packets) => set({ blacklistedPackets: packets }),
        setAutoScroll: (autoScroll) => set({ autoScroll }),
        setOnlySaveFiltered: (onlySaveFiltered) => set({ onlySaveFiltered }),
      }),
      {
        name: 'settings-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)

export const useSession = create<SessionState>()(
  devtools(
    (set, get) => ({
      logState: "off",
      ws: null,
      connected: false,
      selectedPacket: null,
      registeredPackets: [],
      packetDescriptions: {},
      page: CurrentPage.LIVE_LOGGER,
      setLogState: (logState) => set({ logState }),
      setWs: (ws) => set({ ws }),
      setConnected: (connected) => set({ connected }),
      setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
      setRegisteredPackets: (registeredPackets) => set({ registeredPackets }),
      setPacketDescriptions: (packetDescriptions) => set({ packetDescriptions }),
      setPage: (page) => set({ page }),
    })
  )
)