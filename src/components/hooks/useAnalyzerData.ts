import { create } from "zustand";
import { IAnalyzerRecord } from "../../db/db";

export interface AnalyzerState {
	hasLog: boolean;
	selectedPacket: IAnalyzerRecord | null;
	mapping: "yarn" | "mojang" | "intermediary";
	logTitle: string;
	metaMinimized: boolean;
	frontendView: Exclude<IAnalyzerRecord, "data">[];

	setHasLog: (hasLog: boolean) => void;
	setSelectedPacket: (selectedPacket: IAnalyzerRecord | null) => void;
	setMapping: (mapping: "yarn" | "mojang" | "intermediary") => void;
	setLogTitle: (logTitle: string) => void;
	setMetaMinimized: (metaMinimized: boolean) => void;
	setFrontendView: (frontendView: Exclude<IAnalyzerRecord, "data">[]) => void;
}

export const useAnalyzerData = create<AnalyzerState>()((set, get) => ({
	hasLog: false,
	selectedPacket: null,
	mapping: "yarn",
	logTitle: "",
	metaMinimized: false,
	frontendView: [],
	setHasLog: (hasLog) => set({ hasLog }),
	setSelectedPacket: (selectedPacket) => set({ selectedPacket }),
	setMapping: (mapping) => set({ mapping }),
	setLogTitle: (logTitle) => set({ logTitle }),
	setMetaMinimized: (metaMinimized) => set({ metaMinimized }),
	setFrontendView: (frontendView) => set({ frontendView }),
}));
