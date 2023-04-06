import { TransferListData } from "@mantine/core/lib/TransferList/types";
import { useEffect, useMemo, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./loglist.module.css";
import { IBasePacket } from "./types";
import { Code } from "@mantine/core";

const LogList = (props: {
	data: Array<IBasePacket>;
	filters: TransferListData;
	onSelect: Function;
	selected: number | null;
}) => {
	return (
		<div className={styles.container}>
			{props.data.map((item, index) => {
				if (props.filters[1].length > 0) {
					if (props.filters[1].map((item) => item.value).includes(item.data.legacyName + "S2CPacket")) {
						return <LogLine
              key={index}
              timestamp={item.timestamp}
              data={item.data}
              selected={item.id === props.selected}
              onClick={() => props.onSelect(item.id === props.selected ? null : item.id)}
            />
					}

					return null;
				}

				return (
					<LogLine
						key={index}
						timestamp={item.timestamp}
						data={item.data}
						selected={item.id === props.selected}
						onClick={() => props.onSelect(item.id === props.selected ? null : item.id)}
					/>
				);
			})}
		</div>
	);
};

const LogLine = (props: {
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
				{props.data.name} <span className={styles.legacy_packet_name}>({props.data.legacyName + "S2CPacket"})</span>
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
