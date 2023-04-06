import { TransferListData } from "@mantine/core/lib/TransferList/types";
import { useEffect, useState } from "react";
import Inspector from "./components/Inspector";
import LogList from "./components/LogList";
import Sidebar from "./components/Sidebar";
import { IBasePacket, IDescription } from "./components/types";

const initialValues: TransferListData = [[], []];

let globalId = 0;

function App() {
	const [data, setData] = useState<Array<IBasePacket>>([]);
	const [connected, setConnected] = useState(false);
  const [connectedUpdate, setConnectedUpdate] = useState(0);
	const [filterData, setFilterData] = useState<TransferListData>(initialValues);
	const [descriptionData, setDescriptionData] = useState<{[key: string]: IDescription}>({});
	const [selectedPacket, setSelectedPacket] = useState<number | null>(null);

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
				setFilterData([data.allPackets, []]);
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
		<div style={{
			display: "flex",
			flexDirection: "row",
			width: "100%"
		}}>
			<Sidebar
				connected={connected}
				transferListData={filterData}
				setTransferListData={setFilterData}
				onReconnect={() => setConnectedUpdate(connectedUpdate + 1)}
			/>
			<div style={{
				display: "flex",
				flexDirection: "row",
				width: "100%"
			}}>
				<LogList data={data} filters={filterData} onSelect={setSelectedPacket} selected={selectedPacket} />
				<Inspector selectedPacket={selectedPacket !== null ? data.filter(p => p.id === selectedPacket)[0] : null} descriptions={descriptionData} />
			</div>
		</div>
	);
}

export default App;
