import { Code, Loader } from "@mantine/core";
import { useMemo, useEffect, useRef } from "react";
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
	const [autoScroll, whitelist, blacklist, autoRightAlign, applyWhiteBlackList] = useSettings((state) => [
		state.autoScroll,
		state.whitelistedPackets,
		state.blacklistedPackets,
		state.loglistClientboundRightAligned,
		state.applyWhiteBlackListCurrent
	]);
	const ref = useRef<HTMLDivElement>();

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
			{props.data.map((item, index) => {
				let returnable: JSX.Element | null = (
					<LogLine
						key={index}
						data={item}
						clientVersion={props.clientVersion}
						selected={index === selectedPacket}
						onClick={() => {
							props.onLogClick(index);
						}}
						autoRightAlign={autoRightAlign}
						body={index === selectedPacket ? props.selectedPacketBody : null}
					/>
				);
				
				// white/blacklist only applies to live logger
				if (page !== CurrentPage.LIVE_LOGGER) {
					return returnable;
				}

				// only apply white/blacklist to frontend if the user wants it
				if (applyWhiteBlackList === false) {
					return returnable;
				}

				const networkSide = item.direction === NetworkDirection.CLIENTBOUND ? "cbound" : "sbound";
				const networkState = NetworkStateNames[item.networkState].toLowerCase();
				const formattedId = `${networkSide}-${networkState}-0x${item.id.toString(16).padStart(2, "0")}`;

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

export const LogLine = (props: {
	data: IRawPacket;
	clientVersion: string;
	selected: boolean;
	onClick: Function;
	body: { [key: string]: any } | null;
	autoRightAlign: boolean;
}) => {
	const stringifiedData = useMemo(() => JSON.stringify(props.body, null, 2), [props.body]);
	const metadata: PacketMetadata | null = useAsyncMemo(async () => {
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
				<div className={styles.direction}>
					{props.data.direction === NetworkDirection.CLIENTBOUND ? <ArrowBigDownLine size="15" /> : <ArrowBigUpLine size="15" />}
				</div>
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
