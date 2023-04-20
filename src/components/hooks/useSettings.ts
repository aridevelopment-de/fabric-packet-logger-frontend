import ReconnectingWebSocket from "reconnecting-websocket";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

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

export enum LogState {
  OFF = 0,
  LOGGING = 1,
}

export interface SettingsState {
  whitelistedPackets: number[];
  blacklistedPackets: number[];
  autoScroll: boolean;
  onlySaveFiltered: boolean;

  setWhitelistedPackets: (packets: number[]) => void;
  setBlacklistedPackets: (packets: number[]) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  setOnlySaveFiltered: (onlySaveFiltered: boolean) => void;
}

export interface SessionState {
  logState: LogState;
  ws: ReconnectingWebSocket | null;
  connected: boolean;
  // TODO: Make selectedPacket IBasePacket
  selectedPacket: number | null;
  registeredPackets: Array<{value: string; label: string}>;
  page: CurrentPage;

  setLogState: (logState: LogState) => void;
  setWs: (ws: ReconnectingWebSocket | null) => void;
  setConnected: (connected: boolean) => void;
  setSelectedPacket: (selectedPacket: number | null) => void;
  setRegisteredPackets: (registeredPackets: Array<{value: string; label: string}>) => void;
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
      logState: LogState.OFF,
      ws: null,
      connected: false,
      selectedPacket: null,
      registeredPackets: [],
      page: CurrentPage.LIVE_LOGGER,
      setLogState: (logState) => set({ logState }),
      setWs: (ws) => set({ ws }),
      setConnected: (connected) => set({ connected }),
      setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
      setRegisteredPackets: (registeredPackets) => set({ registeredPackets }),
      setPage: (page) => set({ page }),
    })
  )
)