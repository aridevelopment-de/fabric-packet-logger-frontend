import { Code } from "@mantine/core";
import { useMemo, useEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./loglist.module.css";
import { IBasePacket } from "../../types";
import { useSession, useSettings } from "../../hooks/useSettings";

const LogList = (props: {data: IBasePacket[]}) => {
	const [selectedPacket, setSelectedPacket] = useSession((state) => [
		state.selectedPacket, state.setSelectedPacket
	])
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
						timestamp={item.timestamp}
						data={item.data}
						selected={index === selectedPacket}
						onClick={() => setSelectedPacket(index === selectedPacket ? null : index)}
					/>
				);

				if (whitelist.length > 0) {
					if (!whitelist.includes(item.data.id)) {
						returnable = null;
					}
				}

				if (blacklist.length > 0) {
					if (blacklist.includes(item.data.id)) {
						returnable = null;
					}
				}

				return returnable;
			})}
		</div>
	);
};

export const LogLine = (props: {
	timestamp: IBasePacket["timestamp"];
	data: IBasePacket["data"];
	selected: boolean;
	onClick: Function;
}) => {
	const stringifiedData = useMemo(() => JSON.stringify(props.data.data, null, 2), [props.data.data]);

	return (
		<div className={styles.line} onClick={() => props.onClick()}>
			<div className={styles.timestamp}>{new Date(props.timestamp).toLocaleTimeString()}</div>
			<div className={styles.packet_name}>
				{props.data.name}{" "}
				<span className={styles.legacy_packet_name}>({props.data.legacyName + "S2CPacket"})</span>
			</div>

			{props.selected && (
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
