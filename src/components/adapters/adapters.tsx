import { IBasePacket } from "../types";
import MapUpdateS2CAdapter from "./MapUpdateS2C";

export const EMPTY_PACKET: IBasePacket = {
  id: -1,
	timestamp: -1,
	data: {
		name: "-1",
		legacyName: "-1",
		id: "-1",
		data: {},
	}
}

export const ADAPTERS = {
  "PLAY-0x29": <MapUpdateS2CAdapter data={EMPTY_PACKET} />,
}