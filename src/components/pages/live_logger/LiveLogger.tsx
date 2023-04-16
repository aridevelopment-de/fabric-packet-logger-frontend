import { useCallback, useEffect } from "react";
import { downloadContentBig } from "../../../utils/browserutils";
import EventHandler, { EventType } from "../../../utils/eventhandler";
import { useSession } from "../../hooks/useSettings";
import { IBasePacket } from "../../types";
import Inspector from "./Inspector";
import LogList from "./LogList";
import Sidebar from "./Sidebar";

function LiveLogger(props: { data: IBasePacket[] }) {
	// Way around for react-query not updating the state
	const [ws, selectedPacketId, setLogState] = useSession((state) => [state.ws, state.selectedPacket, state.setLogState]);

	const onMessage = useCallback(
		(event: MessageEvent) => {
			const packetData = JSON.parse(event.data);

			if (packetData.type === "loggingState") {
				setLogState(packetData.state);
			}
		},
		[setLogState]
	);

	useEffect(() => {
		if (ws) {
			ws.addEventListener("message", onMessage);
			return () => {
				ws.removeEventListener("message", onMessage);
			};
		}
	}, [ws, onMessage]);

	return (
		<div
			style={{
				flex: "1 1 auto",
				display: "flex",
				overflow: "hidden",
			}}
		>
			<Sidebar
				setData={() => EventHandler.emit(EventType.DATA_CLEAR)}
				onReconnect={() => ws ? ws.reconnect() : void 0}
				onDownload={() => {
					const date = new Date();
					downloadContentBig(
						`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-packet-dump.json`,
						JSON.stringify(props.data, null)
					);
				}}
			/>
			<LogList data={props.data} />
			<Inspector data={props.data} selectedPacketId={selectedPacketId} />
		</div>
	);
}

export default LiveLogger;
