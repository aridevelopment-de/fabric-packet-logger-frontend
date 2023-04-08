import { useCallback, useEffect, useState } from "react";
import Inspector from "./components/Inspector";
import LogList from "./components/LogList";
import Sidebar from "./components/Sidebar";
import { IBasePacket, IDescription } from "./components/types";

let globalId = 0;

function App() {
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [data, setData] = useState<Array<IBasePacket>>([]);
	const [connected, setConnected] = useState(false);
	const [connectedUpdate, setConnectedUpdate] = useState(0);
	const [whitelistData, setWhitelistData] = useState<Array<string>>([]);
	const [blacklistData, setBlacklistData] = useState<Array<string>>([]);
	const [allPackets, setAllPackets] = useState<Array<{ value: string; label: string }>>([]);
	const [descriptionData, setDescriptionData] = useState<{ [key: string]: IDescription }>({});
	const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
	const [autoScroll, setAutoScroll] = useState<boolean>(false);
	const [onlySaveFiltered, setOnlySaveFiltered] = useState<boolean>(false);
	const [logState, setLogState] = useState<string>("off");

	const onMessage = useCallback((event: MessageEvent) => {
		const data = JSON.parse(event.data);

		if (data.type === "packet") {
			if (!onlySaveFiltered) {
				setData((prevData) => {
					return [
						...prevData,
						{
							timestamp: Date.now(),
							id: globalId++,
							data: data,
						},
					];
				});

				return;
			} else {
				let shallAdd = true;

				if (whitelistData.length > 0) {
					if (!whitelistData.includes(data.id)) {
						shallAdd = false;
					}
				}

				if (blacklistData.length > 0) {
					if (blacklistData.includes(data.id)) {
						shallAdd = false;
					}
				}

				if (shallAdd) {
					setData((prevData) => {
						return [
							...prevData,
							{
								timestamp: Date.now(),
								id: globalId++,
								data: data,
							},
						];
					});
				}
			}
		}
	}, [onlySaveFiltered, whitelistData, blacklistData]);

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
				setAllPackets(data.allPackets);
				setDescriptionData(data.descriptions);
	
				console.log(data.allPackets);
			} else if (data.type === "loggingState") {
				setLogState(data.state);
			}
		})

		return () => {
			ws.close();
		};
	}, [connectedUpdate]);

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
			<Sidebar
				connected={connected}
				initialWhitelistData={allPackets}
				whitelistData={whitelistData}
				blacklistData={blacklistData}
				autoScroll={autoScroll}
				loggingState={logState}
				onlySaveFiltered={onlySaveFiltered}
				setWhitelistData={setWhitelistData}
				setBlacklistData={setBlacklistData}
				onReconnect={() => setConnectedUpdate(connectedUpdate + 1)}
				onClear={() => setData([])}
				onAutoScroll={(value) => setAutoScroll(value)}
				onOnlySaveFiltered={(value) => setOnlySaveFiltered(value)}
				onLoggingState={(value) => {
					if (ws) {
						setLogState(value);
						ws.send(JSON.stringify({
							type: "loggingState",
							state: value
						}))
					}
				}}
			/>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					width: "100%",
				}}
			>
				<LogList
					data={data}
					whitelist={whitelistData}
					blacklist={blacklistData}
					onSelect={setSelectedPacket}
					selected={selectedPacket}
					autoScroll={autoScroll}
				/>
				<Inspector
					selectedPacket={selectedPacket !== null ? data.filter((p) => p.id === selectedPacket)[0] : null}
					descriptions={descriptionData}
				/>
			</div>
		</div>
	);
}

export default App;
