import { Button, Checkbox, Divider, Group, MultiSelect, SegmentedControl } from "@mantine/core";
import { FileExport } from "tabler-icons-react";
import { LogState, useSession, useSettings } from "../../hooks/useSettings";
import styles from "./sidebar.module.css";
import EventHandler, { EventType } from "../../../utils/eventhandler";
import { PacketId } from "../../types";

const Sidebar = (props: { onReconnect: () => void, onDownload: () => void }) => {
	const [
		whitelist,
		blacklist,
		autoScroll,
		onlySaveFiltered,
		setWhitelist,
		setBlacklist,
		setAutoScroll,
		setOnlySaveFiltered,
	] = useSettings((state) => [
		state.whitelistedPackets,
		state.blacklistedPackets,
		state.autoScroll,
		state.onlySaveFiltered,
		state.setWhitelistedPackets,
		state.setBlacklistedPackets,
		state.setAutoScroll,
		state.setOnlySaveFiltered,
	]);

	const [ws, connected, logState, registeredPackets, setLogState, setSelectedPacket] = useSession((state) => [
		state.ws,
		state.connected,
		state.logState,
		state.registeredPackets,
		state.setLogState,
		state.setSelectedPacket
	]);

	return (
		<div className={styles.container}>
			<div className={styles.ws_status}>
				<span>
					Connected to mc:{" "}
					<span style={{ color: connected ? "var(--color-green)" : "var(--color-red)" }}>
						{String(connected)}
					</span>
				</span>
			</div>
			<div className={styles.action_group}>
				<SegmentedControl
					data={[
						{ label: "Logging", value: "logging" },
						{ label: "Not logging", value: "off" },
					]}
					// TODO: Temporary fix
					value={logState === LogState.LOGGING ? "logging" : "off"}
					onChange={(value: "logging" | "off") => {
						const newLogState = value === "logging" ? LogState.LOGGING : LogState.OFF;

						if (ws) {
							ws.send(JSON.stringify({ id: PacketId.PACKETLOGGER_LOGSTATE, data: newLogState }));
						}

						setLogState(newLogState);
					}}
					style={{ width: "fit-content" }}
				/>
				<Group spacing="md">
					<Button onClick={props.onReconnect}>Reconnect</Button>
					<Button color="red" onClick={() => {
						setSelectedPacket(null);
						EventHandler.emit(EventType.DATA_CLEAR);
					}}>
						Clear
					</Button>
				</Group>
			</div>
			<Divider my="xl" />
			<div className={styles.packet_whitelist}>
				<span className={styles.title}>Packet whitelist</span>
				<MultiSelect
					data={registeredPackets}
					value={whitelist.map(a => String(a))}
					onChange={(v: string[]) => setWhitelist(v.map(a => Number(a)))}
					clearable
					searchable
					placeholder="Pick all packets that you want to see"
					nothingFound="No packets found"
				/>
			</div>
			<div className={styles.packet_blacklist}>
				<span className={styles.title}>Packet Blacklist</span>
				<MultiSelect
					data={registeredPackets}
					value={blacklist.map(a => String(a))}
					onChange={(v: string[]) => setBlacklist(v.map(a => Number(a)))}
					clearable
					searchable
					placeholder="Pick all packets that you don't want to see"
					nothingFound="No packets found"
				/>
			</div>
			<Divider my="xl" />
			<div className={styles.config}>
				<Button color="orange" leftIcon={<FileExport />} onClick={props.onDownload}>Export</Button>
				<Checkbox
					onChange={(e) => setAutoScroll(e.currentTarget.checked)}
					checked={autoScroll}
					label="Autoscroll"
				/>
				<Checkbox
					onChange={(e) => setOnlySaveFiltered(e.currentTarget.checked)}
					checked={onlySaveFiltered}
					label="Only save filtered packets"
				/>
			</div>
		</div>
	);
};

export default Sidebar;
