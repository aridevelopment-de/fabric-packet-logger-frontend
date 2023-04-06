import { Button, TransferList } from "@mantine/core";
import { TransferListData } from "@mantine/core/lib/TransferList/types";
import styles from "./sidebar.module.css";

const Sidebar = (props: {
	connected: boolean;
	transferListData: TransferListData;
	setTransferListData: (value: TransferListData) => void;
  onReconnect: () => void;
}) => {
	return (
		<div className={styles.container}>
			<span>
				Connected to mc:{" "}
				<span style={{ color: props.connected ? "var(--color-green)" : "var(--color-red)" }}>
					{String(props.connected)}
				</span>
        <Button onClick={props.onReconnect} style={{marginTop: "1em"}}>Reconnect</Button>
			</span>
			<span className={styles.title}>Packet-Filter</span>
			<div className={styles.filters}>
				<TransferList
					value={props.transferListData}
					onChange={props.setTransferListData}
					searchPlaceholder="Search for packet name..."
					nothingFound="No packets found"
					titles={["Available", "Whitelist"]}
					breakpoint="sm"
					style={{
						gridTemplateColumns: "300px",
						gridTemplateRows: "1fr 1fr",
					}}
				/>
			</div>
		</div>
	);
};

export default Sidebar;
