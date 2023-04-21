export enum PacketId {
	PACKETLOGGER_LOGSTATE,
	MC_PACKET_RECEIVED,
	MC_PACKET_SENT,
	REQUEST_MC_PACKET_INFO,
	MC_PACKET_INFO,
	REQUEST_CLEAR
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
	CLIENTBOUND = 0,
	SERVERBOUND = 1,
}

export interface IRawPacket {
	id: number;
	timestamp: number;
	index: number;
	networkState: NetworkState;
	direction: NetworkDirection;
}
