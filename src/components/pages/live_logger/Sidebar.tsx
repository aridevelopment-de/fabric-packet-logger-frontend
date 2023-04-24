import { Button, Checkbox, Divider, Group, MultiSelect, SegmentedControl } from "@mantine/core";
import { FileExport } from "tabler-icons-react";
import EventHandler, { EventType } from "../../../utils/eventhandler";
import { Metadata, metadataManager } from "../../../utils/metadatamanager";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { LogState, useSession, useSettings } from "../../hooks/useSettings";
import { PacketId } from "../../types";
import styles from "./sidebar.module.css";

const Sidebar = (props: { onReconnect: () => void }) => {
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

	const [ws, connected, logState, setLogState, setSelectedPacket] = useSession((state) => [
		state.ws,
		state.connected,
		state.logState,
		state.setLogState,
		state.setSelectedPacket
	]);

	const initialWhiteBlackListData = useAsyncMemo(async () => {
		// { value: 'react', label: 'React' },
		// { value: 'play-0x4E', label: 'SetCenterChunk' }
		const meta: Metadata | null = await metadataManager.getMetadata();
		if (meta === null) return [];

		// for now we only care about clientbound packets
		const clientbound = meta.clientbound;
		const returnable: { value: string, label: string }[] = [];

		for (let category in clientbound) {
			for (let packetId in clientbound[category as keyof typeof clientbound]) {
				const packet = clientbound[category as keyof typeof clientbound][packetId];
				const name = packet.name;

				returnable.push({
					value: `${category}-${packetId}`,
					label: name
				});
			}
		}

		return returnable;
	}, []);

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
					data={initialWhiteBlackListData ?? []}
					value={whitelist}
					onChange={setWhitelist}
					clearable
					searchable
					placeholder="Pick all packets that you want to see"
					nothingFound="No packets found"
				/>
			</div>
			<div className={styles.packet_blacklist}>
				<span className={styles.title}>Packet Blacklist</span>
				<MultiSelect
					data={initialWhiteBlackListData ?? []}
					value={blacklist}
					onChange={setBlacklist}
					clearable
					searchable
					placeholder="Pick all packets that you don't want to see"
					nothingFound="No packets found"
				/>
			</div>
			<Divider my="xl" />
			<div className={styles.config}>
				<Button color="orange" leftIcon={<FileExport />} onClick={() => {
					if (ws === null) return;

					ws.send(JSON.stringify({
						id: PacketId.REQUEST_EXPORT,
						data: {
							whitelist: whitelist,
							blacklist: blacklist, 
						}
					}))
				}}>Export</Button>
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
