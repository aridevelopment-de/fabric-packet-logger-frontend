import ReconnectingWebSocket from "reconnecting-websocket";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export enum CurrentPage {
  LIVE_LOGGER = "Live Logger",
  ANALYZER = "Analyzer",
  INTERCEPTOR = "Interceptor",
  SEQUENCER = "Sequencer",
  COMPARER = "Comparer",
  PACKET_LIST = "Packet List",
  SETTINGS = "Settings",
}

export enum LogState {
  OFF = 0,
  LOGGING = 1,
}

export interface SettingsState {
  whitelistedPackets: string[];
  blacklistedPackets: string[];
  autoScroll: boolean;
  loglistClientboundRightAligned: boolean;
  applyWhiteBlackListCurrent: boolean;
  packetStacking: boolean;

  setWhitelistedPackets: (packets: string[]) => void;
  setBlacklistedPackets: (packets: string[]) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  setLoglistClientboundRightAligned: (loglistClientboundRightAligned: boolean) => void;
  setApplyWhiteBlackListCurrent: (applyWhiteBlackListCurrent: boolean) => void;
  setPacketStacking(packetStacking: boolean): void;
}

export interface SessionState {
  logState: LogState;
  ws: ReconnectingWebSocket | null;
  connected: boolean;
  selectedPacket: number | null;
  page: CurrentPage;

  setLogState: (logState: LogState) => void;
  setWs: (ws: ReconnectingWebSocket | null) => void;
  setConnected: (connected: boolean) => void;
  setSelectedPacket: (selectedPacket: number | null) => void;
  setPage: (page: CurrentPage) => void;
}

export const useSettings = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        whitelistedPackets: [],
        blacklistedPackets: [],
        autoScroll: true,
        loglistClientboundRightAligned: false,
        applyWhiteBlackListCurrent: false,
        packetStacking: true,
        setWhitelistedPackets: (packets) => set({ whitelistedPackets: packets }),
        setBlacklistedPackets: (packets) => set({ blacklistedPackets: packets }),
        setAutoScroll: (autoScroll) => set({ autoScroll }),
        setLoglistClientboundRightAligned: (loglistClientboundRightAligned) => set({ loglistClientboundRightAligned }),
        setApplyWhiteBlackListCurrent: (applyWhiteBlackListCurrent) => set({ applyWhiteBlackListCurrent }),
        setPacketStacking: (packetStacking) => set({ packetStacking }),
      }),
      {
        name: 'packetlogger-settings-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)

export const useSession = create<SessionState>()(
  devtools(
    (set, get) => ({
      logState: LogState.OFF,
      ws: null,
      connected: false,
      selectedPacket: null,
      page: CurrentPage.LIVE_LOGGER,
      setLogState: (logState) => set({ logState }),
      setWs: (ws) => set({ ws }),
      setConnected: (connected) => set({ connected }),
      setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
      setPage: (page) => set({ page }),
    })
  )
)