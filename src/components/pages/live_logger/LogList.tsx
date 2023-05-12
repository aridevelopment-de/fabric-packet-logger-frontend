import { Code, Loader } from "@mantine/core";
import { useMemo, useEffect, useRef, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./loglist.module.css";
import { IRawPacket, NetworkDirection, NetworkStateNames } from "../../types";
import { CurrentPage, LogState, useSession, useSettings } from "../../hooks/useSettings";
import { PacketMetadata, metadataManager } from "../../../utils/metadatamanager";
import { capitalize } from "../../../utils/stringutils";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { ArrowBigDownLine, ArrowBigUpLine } from "tabler-icons-react";

const LogList = (props: {
	data: IRawPacket[];
	clientVersion: string;
	selectedPacketBody: { [key: string]: any } | null;
	onLogClick: (index: number) => void;
}) => {
	const [selectedPacket, page, logState] = useSession((state) => [state.selectedPacket, state.page, state.logState]);
	const [autoScroll, whitelist, blacklist, autoRightAlign, applyWhiteBlackList, stackPackets] = useSettings((state) => [
		state.autoScroll,
		state.whitelistedPackets,
		state.blacklistedPackets,
		state.loglistClientboundRightAligned,
		state.applyWhiteBlackListCurrent,
		state.packetStacking,
	]);
	const ref = useRef<HTMLDivElement>();
	const regroupedData: Array<IRawPacket[]> | null = useMemo(() => {
		if (stackPackets) {
			// packet list looks something like this
			// [{IRawPacket}, {IRawPacket}, {IRawPacket}, {IRawPacket}, {IRawPacket}, ...]
			// now, we want to group them by their packetId, direction and state
			// such that we get something like this:
			// [[{IRawPacket}, {IRawPacket}], [{IRawPacket}, {IRawPacket}, {IRawPacket}], ...]
			// where each array contains packets with the same packetId, direction and state
			let grouped: Array<IRawPacket[]> = [];

			props.data.reduce((prev, curr) => {
				if (prev.id === curr.id && prev.direction === curr.direction && prev.networkState === curr.networkState && grouped[grouped.length - 1] !== undefined) {
					grouped[grouped.length - 1].push(curr);
				} else {
					grouped.push([curr]);
				}

				return curr;
			}, props.data[0]);
			
			return grouped;
		} else {
			return null;
		}
	}, [stackPackets, props.data]);

	useEffect(() => {
		// initial auto scroll
		if (autoScroll && ref.current && logState === LogState.LOGGING) {
			const element = ref.current;
			element.scrollTop = element.scrollHeight;
		}
	}, [autoScroll, whitelist.length, blacklist.length, logState]);

	useEffect(() => {
		if (autoScroll && selectedPacket === null && ref.current && logState === LogState.LOGGING) {
			const element = ref.current;
			// element.scrollTop = element.scrollHeight;
			// smooth scrolling
			element.scrollTo({
				top: element.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [autoScroll, selectedPacket, props.data.length, logState]);

	return (
		// @ts-ignore
		<div className={styles.container} ref={ref}>
			{(regroupedData !== null ? regroupedData : props.data).map((item: IRawPacket | IRawPacket[], keyIndex) => {
				let returnable: JSX.Element | null = null;
				
				if (Array.isArray(item) && item.length > 1) {
					returnable = (
						<LogGroup
							key={keyIndex}
							data={item}
							clientVersion={props.clientVersion}
							selectedPacketIndex={selectedPacket}
							selectedPacketBody={props.selectedPacketBody}
							autoRightAlign={autoRightAlign}
							onLogClick={(subIndex: number) => {
								props.onLogClick(subIndex);
							}}
						/>
					);
				} else {
					let itemCopy = Array.isArray(item) ? item[0] : item;

					returnable = <LogLine
						key={keyIndex}
						data={itemCopy}
						clientVersion={props.clientVersion}
						selected={itemCopy.index === selectedPacket}
						onClick={() => {
							props.onLogClick(itemCopy.index);
						}}
						autoRightAlign={autoRightAlign}
						body={itemCopy.index === selectedPacket ? props.selectedPacketBody : null}
						isChild={false}
					/>
				}
				
				// white/blacklist only applies to live logger
				if (page !== CurrentPage.LIVE_LOGGER) {
					return returnable;
				}

				// only apply white/blacklist to frontend if the user wants it
				if (applyWhiteBlackList === false) {
					return returnable;
				}

				const exPacket = Array.isArray(item) ? item[0] : item;
				const networkSide = exPacket.direction === NetworkDirection.CLIENTBOUND ? "cbound" : "sbound";
				const networkState = NetworkStateNames[exPacket.networkState].toLowerCase();
				const formattedId = `${networkSide}-${networkState}-0x${exPacket.id.toString(16).padStart(2, "0")}`;

				if (whitelist.length > 0) {
					if (!whitelist.includes(formattedId)) {
						returnable = null;
					}
				}

				if (blacklist.length > 0) {
					if (blacklist.includes(formattedId)) {
						returnable = null;
					}
				}

				return returnable;
			})}
		</div>
	);
};

const LogGroup = (props: {
	data: IRawPacket[];
	clientVersion: string;
	selectedPacketIndex: number | null;
	selectedPacketBody: { [key: string]: any } | null;
	autoRightAlign: boolean;
	onLogClick: (index: number) => void;
}) => {
	const metadata: PacketMetadata | null = useAsyncMemo(async () => {
		const meta = await metadataManager.getMetadata(props.clientVersion);
		if (meta === null) return null;
		let packetMeta = null;

		const packet = props.data[0];

		try {
			packetMeta =
				// @ts-ignore
				meta[packet.direction === NetworkDirection.CLIENTBOUND ? "clientbound" : "serverbound"][NetworkStateNames[packet.networkState]][
					"0x" + packet.id.toString(16).padStart(2, "0")
				];
		} catch (e) {
			console.error(e);
			return null;
		}
		return packetMeta;
	}, [props]);
	
	const [collapsed, setCollapsed] = useState(false);
	if (metadata === null || metadata === undefined) return null;

	return (
		<div className={styles.group} data-more-than-one={props.data.length > 1}>
			<div onClick={() => setCollapsed(!collapsed)} className={`${styles.header} ${props.autoRightAlign ? styles.auto_right_align : ''} ${props.data[0].direction === NetworkDirection.CLIENTBOUND ? styles.clientbound : ''}`}>
				<div className={styles.direction}>
					{props.data[0].direction === NetworkDirection.CLIENTBOUND ? <ArrowBigDownLine size="15" /> : <ArrowBigUpLine size="15" />}
				</div>
				<div className={styles.timestamp}>{new Date(props.data[0].timestamp).toLocaleTimeString()}</div>
				{props.data.length > 1 && (
					<div className={`${styles.timestamp} ${styles.timestamp_end}`}>
						{new Date(props.data[props.data.length - 1].timestamp).toLocaleTimeString()}
					</div>
				)}
				<div className={styles.packet_name}>
					{metadata.name}{" "}
					<span className={styles.legacy_packet_name}>
						(
						{capitalize(NetworkStateNames[props.data[0].networkState]) +
							" 0x" +
							props.data[0].id.toString(16).padStart(2, "0")}
						){" "}
					</span>
					<span className={styles.stacked_number}>
						({props.data.length})
					</span>
				</div>
			</div>
			{collapsed && (
				<div className={styles.collapsed}>
					{props.data.map((item: IRawPacket, keyIdx: number) => {
						return (
							<LogLine
								key={keyIdx}
								data={item}
								clientVersion={props.clientVersion}
								selected={item.index === props.selectedPacketIndex}
								onClick={() => {
									props.onLogClick(item.index);
								}}
								autoRightAlign={props.autoRightAlign}
								body={item.index === props.selectedPacketIndex ? props.selectedPacketBody : null}
								metadata={metadata}
								isChild={true}
							/>
						);
					})}
				</div>
			)}
		</div>
	)
}

export const LogLine = (props: {
	data: IRawPacket;
	clientVersion: string;
	selected: boolean;
	onClick: Function;
	body: { [key: string]: any } | null;
	autoRightAlign: boolean;
	metadata?: PacketMetadata;
	isChild: boolean;
}) => {
	const stringifiedData = useMemo(() => JSON.stringify(props.body, null, 2), [props.body]);
	const metadata: PacketMetadata | null = useAsyncMemo(async () => {
		if (props.metadata !== undefined) return props.metadata;
		const meta = await metadataManager.getMetadata(props.clientVersion);
		if (meta === null) return null;
		let packetMeta = null;

		try {
			packetMeta =
				// @ts-ignore
				meta[props.data.direction === NetworkDirection.CLIENTBOUND ? "clientbound" : "serverbound"][NetworkStateNames[props.data.networkState]][
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
			<div className={`${styles.header} ${props.autoRightAlign ? styles.auto_right_align : ''} ${props.data.direction === NetworkDirection.CLIENTBOUND ? styles.clientbound : ''}`}>
				{!props.isChild && (
					<div className={styles.direction}>
						{props.data.direction === NetworkDirection.CLIENTBOUND ? <ArrowBigDownLine size="15" /> : <ArrowBigUpLine size="15" />}
					</div>
				)}
				<div className={styles.timestamp}>{new Date(props.data.timestamp).toLocaleTimeString()}</div>
				<div className={styles.packet_name}>
					{metadata.name}{" "}
					{!props.isChild && (
						<span className={styles.legacy_packet_name}>
							(
							{capitalize(NetworkStateNames[props.data.networkState]) +
								" 0x" +
								props.data.id.toString(16).padStart(2, "0")}
							)
						</span>
					)}
				</div>
			</div>
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
	)
};

export default LogList;
