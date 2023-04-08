import { useEffect, useState } from "react";
import Inspector from "./components/Inspector";
import LogList from "./components/LogList";
import Sidebar from "./components/Sidebar";
import { IBasePacket, IDescription } from "./components/types";

let globalId = 0;

function App() {
	const [data, setData] = useState<Array<IBasePacket>>([]);
	const [connected, setConnected] = useState(false);
	const [connectedUpdate, setConnectedUpdate] = useState(0);
	const [whitelistData, setWhitelistData] = useState<Array<string>>([]);
	const [blacklistData, setBlacklistData] = useState<Array<string>>([]);
	const [allPackets, setAllPackets] = useState<Array<{ value: string; label: string }>>([]);
	const [descriptionData, setDescriptionData] = useState<{ [key: string]: IDescription }>({});
	const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
	const [autoScroll, setAutoScroll] = useState<boolean>(false);

	useEffect(() => {
		const port = new URLSearchParams(document.location.search).get("wssPort") || "1337";
		const ws = new WebSocket("ws://localhost:" + port);

		ws.onopen = () => {
			console.log("Connected to server");
			setConnected(true);
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.allPackets !== undefined) {
				setAllPackets(data.allPackets);
				setDescriptionData(data.descriptions);

				console.log(data.allPackets);
			} else {
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
		};

		ws.onclose = () => {
			console.log("Disconnected from server");
			setConnected(false);
		};

		return () => {
			ws.close();
		};
	}, [connectedUpdate]);

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
				setWhitelistData={setWhitelistData}
				setBlacklistData={setBlacklistData}
				onReconnect={() => setConnectedUpdate(connectedUpdate + 1)}
				onClear={() => setData([])}
				onAutoScroll={(value) => setAutoScroll(value)}
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
