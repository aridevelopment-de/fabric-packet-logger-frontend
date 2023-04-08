import { useCallback, useEffect, useState } from "react";
import Inspector from "./components/Inspector";
import LogList from "./components/LogList";
import Sidebar from "./components/Sidebar";
import { SettingsState, useSession, useSettings } from "./components/hooks/useSettings";
import { IBasePacket } from "./components/types";

let globalId = 0;

function App() {
	// Way around for react-query not updating the state
	const [connectedUpdate, setConnectedUpdate] = useState(0);
	const [data, setData] = useState<IBasePacket[]>([]);
	const [ws, setWs, setConnected, setRegisteredPackets, setPacketDescriptions, setLogState] =
		useSession((state) => [
			state.ws,
			state.setWs,
			state.setConnected,
			state.setRegisteredPackets,
			state.setPacketDescriptions,
			state.setLogState,
		]);
	const [whitelistData, blacklistData, onlySaveFiltered] = useSettings((state: SettingsState) => [
		state.whitelistedPackets,
		state.blacklistedPackets,
		state.onlySaveFiltered,
	]);

	const onMessage = useCallback(
		(event: MessageEvent) => {
			const packetData = JSON.parse(event.data);

			if (packetData.type === "packet") {
				if (!onlySaveFiltered) {
					setData((d) => [...d, {
						timestamp: Date.now(),
						id: globalId++,
						data: packetData,
					}]);

					return;
				} else {
					let shallAdd = true;

					if (whitelistData.length > 0) {
						if (!whitelistData.includes(packetData.id)) {
							shallAdd = false;
						}
					}

					if (blacklistData.length > 0) {
						if (blacklistData.includes(packetData.id)) {
							shallAdd = false;
						}
					}

					if (shallAdd) {
						setData((d) => [...d, {
							timestamp: Date.now(),
							id: globalId++,
							data: packetData,
						}]);
					}
				}
			}
		},
		[onlySaveFiltered, whitelistData, blacklistData]
	);

	useEffect(() => {
		const port = new URLSearchParams(document.location.search).get("wssPort") || "1337";
		const ws = new WebSocket("ws://localhost:" + port);

		ws.onopen = () => {
			console.log("Connected to server");
			setConnected(true);
			setWs(ws);
		};

		ws.onclose = () => {
			console.log("Disconnected from server");
			setConnected(false);
		};

		ws.addEventListener("message", (event) => {
			const data = JSON.parse(event.data);

			if (data.type === "init") {
				setRegisteredPackets(data.allPackets);
				setPacketDescriptions(data.descriptions);

				console.log(data.allPackets);
			} else if (data.type === "loggingState") {
				setLogState(data.state);
			}
		});

		return () => {
			ws.close();
		};
	}, [connectedUpdate, setWs, setConnected, setRegisteredPackets, setPacketDescriptions, setLogState]);

	useEffect(() => {
		if (ws) {
			ws.onmessage = (event) => {
				onMessage(event);
			};
		}
	}, [ws, onMessage]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
			}}
		>
			<Sidebar setData={setData} onReconnect={() => setConnectedUpdate(connectedUpdate + 1)} />
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					width: "100%",
				}}
			>
				<LogList data={data} />
				<Inspector data={data} />
			</div>
		</div>
	);
}

export default App;
