import { Button, Checkbox, Divider, MultiSelect } from "@mantine/core";
import styles from "./sidebar.module.css";

const Sidebar = (props: {
	connected: boolean;
	initialWhitelistData: Array<{ value: string; label: string }>;
	whitelistData: Array<string>;
	blacklistData: Array<string>;
	autoScroll: boolean;
	onlySaveFiltered: boolean;
	setWhitelistData: (value: Array<string>) => void;
	setBlacklistData: (value: Array<string>) => void;
	onReconnect: () => void;
	onClear: () => void;
	onAutoScroll: (value: boolean) => void;
	onOnlySaveFiltered: (value: boolean) => void;
}) => {
	return (
		<div className={styles.container}>
			<div className={styles.ws_status}>
				<span>
					Connected to mc:{" "}
					<span style={{ color: props.connected ? "var(--color-green)" : "var(--color-red)" }}>
						{String(props.connected)}
					</span>
				</span>
			</div>
			<div className={styles.action_group}>
				<Button onClick={props.onReconnect}>Reconnect</Button>
				<Button color="red" onClick={props.onClear}>
					Clear
				</Button>
			</div>
			<Divider my="xl" />
			<div className={styles.packet_whitelist}>
				<span className={styles.title}>Packet whitelist</span>
				<MultiSelect
					data={props.initialWhitelistData}
					value={props.whitelistData}
					onChange={props.setWhitelistData}
					clearable
					searchable
					placeholder="Pick all packets that you want to see"
					nothingFound="No packets found"
				/>
			</div>
			<div className={styles.packet_blacklist}>
				<span className={styles.title}>Packet Blacklist</span>
				<MultiSelect
					data={props.initialWhitelistData}
					value={props.blacklistData}
					onChange={props.setBlacklistData}
					clearable
					searchable
					placeholder="Pick all packets that you don't want to see"
					nothingFound="No packets found"
				/>
			</div>
			<Divider my="xl" />
			<div className={styles.config}>
				<Checkbox
					onChange={(e) => props.onAutoScroll(e.currentTarget.checked)}
					checked={props.autoScroll}
					label="Autoscroll"
				/>
				<Checkbox
					onChange={(e) => props.onOnlySaveFiltered(e.currentTarget.checked)}
					checked={props.onlySaveFiltered}
					label="Only save filtered packets"
				/>
			</div>
		</div>
	);
};

export default Sidebar;
