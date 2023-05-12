export enum PacketId {
	PACKETLOGGER_LOGSTATE,
	MC_PACKET_RECEIVED,
	MC_PACKET_SENT,
	REQUEST_MC_PACKET_INFO,
	MC_PACKET_INFO,
	REQUEST_CLEAR,
	REQUEST_EXPORT,
	WHITE_BLACK_LIST_CONFIRM,
	WHITE_BLACK_LIST_CHANGE
}

export interface IWSSPacket {
	id: PacketId;
	data: any;
}

export enum NetworkState {
	HANDSHAKING = 0,
	PLAY = 1,
	STATUS = 2,
	LOGIN = 3,
}

export const NetworkStateNames = [
	"handshaking",
	"play",
	"status",
	"login",
];

export enum NetworkDirection {
	SERVERBOUND = 0,
	CLIENTBOUND = 1,
}

export interface IRawPacket {
	id: number;
	timestamp: number;
	index: number;
	networkState: NetworkState;
	direction: NetworkDirection;
}
