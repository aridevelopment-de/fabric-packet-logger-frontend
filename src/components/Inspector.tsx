import { Code, Table, Text } from "@mantine/core";
import React from "react";
import { ADAPTERS } from "./adapters/adapters";
import styles from "./inspector.module.css";
import { IBasePacket, IDescription } from "./types";

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

const Inspector = (props: { selectedPacket: IBasePacket | null, descriptions: {[key: string]: IDescription} }) => {
	if (props.selectedPacket === null) return null;

  // @ts-ignore
  const adapter: any = ADAPTERS[props.selectedPacket.data.id];
  const description: IDescription = props.descriptions[props.selectedPacket.data.name];

	return (
		<div className={styles.container}>
      <header className={styles.header}>
        <a className={styles.title} href={"https://wiki.vg/Protocol#" + props.selectedPacket.data.name}>
          {props.selectedPacket.data.name}
        </a>
        <Text color="dimmed" className={styles.description}>{description.general}</Text>
      </header>
      <main>
        <ul className={styles.meta}>
          <li><b>Packet Id:</b> {props.selectedPacket.data.id}</li>
          <li><b>Internal name:</b> {props.selectedPacket.data.legacyName}</li>
          <li><b>Direction:</b> Server -&gt; Client</li>
        </ul>
        {description.wikiVgNotes !== undefined && (
          <div className={styles.wikiVgEntry}>
            <span className={styles.wikiVgTitle}>wiki.vg description</span>
            <div className={styles.wikiVgContent}>
              <Text style={{lineHeight: 1.2}}>{description.wikiVgNotes}</Text>
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
              {Object.keys(props.selectedPacket.data.data).map((key, index) => {
                let value = props.selectedPacket!.data.data[key];
                
                if (typeof value === "object") {
                  value = "Object"
                }

                const color = COLORS[typeof props.selectedPacket!.data.data[key]];
                value = JSON.stringify(value);
                
                return (
                  <tr key={index}>
                    <td><Code style={{color: COLORS.key, fontFamily: "Jetbrains Mono, sans-serif"}}>{key}</Code></td>
                    <td><Code style={{color: color, fontFamily: "Jetbrains Mono, sans-serif"}}>{value}</Code></td>
                    {/* @ts-ignore */}
                    <td>{description[key]}</td>
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
              {React.cloneElement(adapter, {data: props.selectedPacket.data.data})}
            </div>
          </div>
        )}
      </main>
		</div>
	);
};

export default Inspector;
