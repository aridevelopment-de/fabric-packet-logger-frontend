import { Code, Loader } from "@mantine/core";
import { useMemo, useEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./loglist.module.css";
import { IRawPacket, NetworkStateNames } from "../../types";
import { useSession, useSettings } from "../../hooks/useSettings";
import { PacketMetadata, metadataManager } from "../../../utils/metadatamanager";
import { capitalize } from "../../../utils/stringutils";

const LogList = (props: {
	data: IRawPacket[];
	selectedPacketBody: { [key: string]: any } | null;
	onLogClick: (index: number) => void;
}) => {
	const [selectedPacket, setSelectedPacket] = useSession((state) => [state.selectedPacket, state.setSelectedPacket]);
	const [autoScroll, whitelist, blacklist] = useSettings((state) => [
		state.autoScroll,
		state.whitelistedPackets,
		state.blacklistedPackets,
	]);
	const ref = useRef<HTMLDivElement>();

	useEffect(() => {
		// initial auto scroll
		if (autoScroll && ref.current) {
			const element = ref.current;
			element.scrollTop = element.scrollHeight;
		}
	}, [autoScroll, whitelist.length, blacklist.length]);

	useEffect(() => {
		if (autoScroll && selectedPacket === null && ref.current) {
			const element = ref.current;
			// element.scrollTop = element.scrollHeight;
			// smooth scrolling
			element.scrollTo({
				top: element.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [autoScroll, selectedPacket, props.data.length]);

	return (
		// @ts-ignore
		<div className={styles.container} ref={ref}>
			{props.data.map((item, index) => {
				let returnable: JSX.Element | null = (
					<LogLine
						key={index}
						data={item}
						selected={index === selectedPacket}
						onClick={() => {
							props.onLogClick(index);
						}}
						body={index === selectedPacket ? props.selectedPacketBody : null}
					/>
				);

				if (whitelist.length > 0) {
					if (!whitelist.includes(item.id)) {
						returnable = null;
					}
				}

				if (blacklist.length > 0) {
					if (blacklist.includes(item.id)) {
						returnable = null;
					}
				}

				return returnable;
			})}
		</div>
	);
};

export const LogLine = (props: {
	data: IRawPacket;
	selected: boolean;
	onClick: Function;
	body: { [key: string]: any } | null;
}) => {
	const stringifiedData = useMemo(() => JSON.stringify(props.body, null, 2), [props.body]);
	const metadata: PacketMetadata | null = useMemo(() => {
		let packetMeta = null;

		try {
			// TODO: Atm we assume the packet is clientbound as serverbound packets are not yet supported
			packetMeta =
				// @ts-ignore
				metadataManager.getMetadata().clientbound[NetworkStateNames[props.data.networkState]][
					"0x" + props.data.id.toString(16).padStart(2, "0")
				];
		} catch (e) {
			console.error(e);
			return null;
		}

		return packetMeta;
	}, [props]);

	if (!metadata) return null;

	return (
		<div className={styles.line} onClick={() => props.onClick()}>
			<div className={styles.timestamp}>{new Date(props.data.timestamp).toLocaleTimeString()}</div>
			<div className={styles.packet_name}>
				{metadata.name}{" "}
				<span className={styles.legacy_packet_name}>
					(
					{capitalize(NetworkStateNames[props.data.networkState]) +
						" 0x" +
						props.data.id.toString(16).padStart(2, "0")}
					)
				</span>
			</div>

			{props.selected && props.body === null && (
				<div className={styles.expanded}>
					<Loader variant="dots" />
				</div>
			)}

			{props.selected && props.body !== null && (
				<div className={styles.expanded}>
					{stringifiedData.length < 1000 ? (
						<SyntaxHighlighter language="json" style={atomOneDark}>
							{stringifiedData}
						</SyntaxHighlighter>
					) : (
						<Code block>{stringifiedData}</Code>
					)}
				</div>
			)}
		</div>
	);
};

export default LogList;
