import { Text } from "@mantine/core";
import React from "react";
import { ADAPTERS } from "./adapters/adapters";
import styles from "./inspector.module.css";
import { IBasePacket, IDescription } from "./types";

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
        <div className={styles.fields}></div>
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
