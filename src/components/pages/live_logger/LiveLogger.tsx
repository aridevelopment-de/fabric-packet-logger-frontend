import { useCallback, useEffect, useState } from "react";
import EventHandler, { EventType } from "../../../utils/eventhandler";
import { useSession } from "../../hooks/useSettings";
import { IRawPacket, IWSSPacket, PacketId } from "../../types";
import Inspector from "./Inspector";
import LogList from "./LogList";
import Sidebar from "./Sidebar";

/*
	TODO for tomorrow:
	- Add functionality to export button
*/

function LiveLogger(props: { data: IRawPacket[] }) {
	const [ws, selectedPacketId, setSelectedPacketId, setLogState] = useSession((state) => [state.ws, state.selectedPacket, state.setSelectedPacket, state.setLogState]);
	const [selectedPacket, setSelectedPacket] = useState<{[key: string]: any} | null>(null);
	const [cachedPackets, setCachedPackets] = useState<
		{ [key: string]: { [key: string]: any } }
	>({});

	const onMessage = useCallback(
		(event: MessageEvent) => {
			const packetData: IWSSPacket = JSON.parse(event.data);

			if (packetData.id === PacketId.PACKETLOGGER_LOGSTATE) {
				setLogState(packetData.data);
			} else if (packetData.id === PacketId.MC_PACKET_INFO) {
				setSelectedPacketId(packetData.data.index);
				setSelectedPacket(packetData.data.packetData);
				setCachedPackets((prev) => ({
					...prev,
					[packetData.data.index]: packetData.data.packetData,
				}));
			}
		},
		[setLogState, setSelectedPacketId]
	);

	useEffect(() => {
		if (ws) {
			ws.addEventListener("message", onMessage);
			return () => {
				ws.removeEventListener("message", onMessage);
			};
		}
	}, [ws, onMessage]);

	useEffect(() => {
		EventHandler.on(EventType.DATA_CLEAR, "livelogger", () => {
			setSelectedPacketId(null);
			setSelectedPacket(null);
			setCachedPackets({});
		});

		return () => {
			EventHandler.off(EventType.DATA_CLEAR, "livelogger");
		};
	})

	return (
		<div
			style={{
				flex: "1 1 auto",
				display: "flex",
				overflow: "hidden",
			}}
		>
			<Sidebar
				onReconnect={() => ws ? ws.reconnect() : void 0}
			/>
			<LogList data={props.data} selectedPacketBody={selectedPacket} onLogClick={(index: number) => {
				if (ws === null) return;
				
				if (index === selectedPacketId) {
					setSelectedPacketId(null);
					setSelectedPacket(null);
					return;
				}

				if (cachedPackets[index]) {
					setSelectedPacketId(index);
					setSelectedPacket(cachedPackets[index]);
					return;
				}

				setSelectedPacketId(null);
				setSelectedPacket(null);

				ws.send(JSON.stringify({
					id: PacketId.REQUEST_MC_PACKET_INFO,
					data: index
				}));
			}} />
			<Inspector data={props.data} selectedPacketId={selectedPacketId} body={selectedPacket} />
		</div>
	);
}

export default LiveLogger;
