import { Code, Table, Text } from "@mantine/core";
import React from "react";
import { ADAPTERS } from "../../adapters/adapters";
import { useSession } from "../../hooks/useSettings";
import styles from "./inspector.module.css";
import { IBasePacket, IDescription } from "../../types";

const COLORS = {
  key: "rgb(209, 154, 102)",
  string: "rgb(152, 195, 121)",
  number: "rgb(209, 154, 102)",
  boolean: "rgb(209, 154, 102)",
  bigint: "rgb(200, 200, 200)",
  symbol: "rgb(200, 200, 200)",
  undefined: "rgb(200, 200, 200)",
  object: "rgb(200, 200, 200)",
  function: "rgb(200, 200, 200)",
}

const Inspector = (props: {data: IBasePacket[], selectedPacketId: number | null}) => {
	const [packetDescriptions] = useSession((state) => [
    state.packetDescriptions,
  ])

  if (props.selectedPacketId === null) return null;

  const selectedPacket = props.data[props.selectedPacketId];

  // To prevent racing conditions
  if (selectedPacket === undefined) return null;

  // @ts-ignore
  const adapter: any = ADAPTERS[selectedPacket.data.id];
  const description: IDescription = packetDescriptions[selectedPacket.data.id];

	return (
		<div className={styles.container}>
      <header className={styles.header}>
        <a className={styles.title} href={"https://wiki.vg/Protocol#" + selectedPacket.data.name}>
          {selectedPacket.data.name}
        </a>
        {(description.general ?? "No description available. Be the first to add one!").split("\n").map((line, idx) =>
          <Text color="dimmed" className={styles.description} key={idx}>{line}</Text>
        )}
      </header>
      <main>
        <ul className={styles.meta}>
          <li><b>Packet Id:</b> {selectedPacket.data.id.split("-")[1]}</li>
          <li><b>Packet category:</b> {selectedPacket.data.id.split("-")[0]}</li>
          <li><b>Internal name:</b> {selectedPacket.data.legacyName}</li>
          <li><b>Direction:</b> Server -&gt; Client</li>
        </ul>
        {description.wikiVgNotes !== undefined && (
          <div className={styles.wikiVgEntry}>
            <span className={styles.wikiVgTitle}>wiki.vg description</span>
            <div className={styles.wikiVgContent}>
              {description.wikiVgNotes.split("\n").map((line, idx) => 
                <Text style={{lineHeight: 1.2}} key={idx}>{line}</Text>
              )}
            </div>
          </div>
        )}
        <div className={styles.fields}>
          <Table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(selectedPacket.data.data).map((key, index) => {
                let value = selectedPacket!.data.data[key];
                
                if (typeof value === "object") {
                  value = "Object"
                }

                const color = COLORS[typeof selectedPacket!.data.data[key]];
                value = JSON.stringify(value);
                
                return (
                  <tr key={index}>
                    <td><Code style={{fontSize: "0.9em", color: COLORS.key, fontFamily: "Jetbrains Mono, sans-serif"}}>{key}</Code></td>
                    <td><Code style={{fontSize: "0.9em", color: color, fontFamily: "Jetbrains Mono, sans-serif"}}>{value}</Code></td>
                    {/* @ts-ignore */}
                    <td style={{fontSize: "1em"}}>{description[key]}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
        {adapter !== undefined && (
          <div className={styles.extra}>
            <span className={styles.extraTitle}>Extra</span>
            <div className={styles.extraContent}>
              {React.cloneElement(adapter, {data: selectedPacket.data.data})}
            </div>
          </div>
        )}
      </main>
		</div>
	);
};

export default Inspector;
