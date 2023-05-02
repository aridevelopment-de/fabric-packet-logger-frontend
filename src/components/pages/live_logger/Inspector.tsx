import { Code, Table, Text } from "@mantine/core";
import { ADAPTERS } from "../../adapters/adapters";
import { IRawPacket, NetworkDirection, NetworkStateNames } from "../../types";
import styles from "./inspector.module.css";
import { Metadata, PacketMetadata, metadataManager } from "../../../utils/metadatamanager";
import { useState, useEffect } from "react";
import React from "react";

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
};

const Inspector = (props: { rawSelected: IRawPacket | null | undefined; body: { [key: string]: any } | null }) => {
	const [metadata, setMetadata] = useState<PacketMetadata | null>(null);

	useEffect(() => {
		if (props.rawSelected === undefined || props.rawSelected === null) return;

		metadataManager.getMetadata().then((meta: Metadata | null) => {
			if (meta === null) return;
			let packetMeta = null;

			try {
				packetMeta =
					// @ts-ignore
					meta[props.rawSelected.direction === NetworkDirection.CLIENTBOUND ? "clientbound" : "serverbound"][NetworkStateNames[props.rawSelected.networkState]][
						// @ts-ignore
						"0x" + props.rawSelected.id.toString(16).padStart(2, "0")
					];
			} catch (e) {
				console.error(e);
				return;
			}

			setMetadata(packetMeta);
		});
	}, [props]);

	if (props.rawSelected === undefined || props.rawSelected === null || metadata === null || props.body === null)
		return null;

	// @ts-ignore
	const adapter: any = ADAPTERS[`${props.rawSelected.direction === NetworkDirection.CLIENTBOUND ? 'cbound' : 'sbound'}-${NetworkStateNames[props.rawSelected.networkState]}-0x${props.rawSelected.id.toString(16).padStart(2, "0")}`];

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<a className={styles.title} href={metadata.url}>
					{metadata.name}
				</a>
				{(metadata.description ?? "No description available. Be the first to add one!")
					.split("\n")
					.map((line, idx) => (
						<Text color="dimmed" className={styles.description} key={idx}>
							{line}
						</Text>
					))}
			</header>
			<main>
				<ul className={styles.meta}>
					<li>
						<b>Packet Id:</b> {"0x" + props.rawSelected.id.toString(16).padStart(2, "0")}
					</li>
					<li>
						<b>Packet category:</b> {NetworkStateNames[props.rawSelected.networkState]}
					</li>
					<li>
						<b>Direction:</b>{" "}
						{props.rawSelected.direction === NetworkDirection.CLIENTBOUND
							? "Server -> Client"
							: "Client -> Server"}
					</li>
				</ul>
				{metadata.notes !== null && (
					<div className={styles.wikiVgEntry}>
						<span className={styles.wikiVgTitle}>Notes</span>
						<div className={styles.wikiVgContent}>
							{metadata.notes.split("\n").map((line, idx) => (
								<Text style={{ lineHeight: 1.2 }} key={idx}>
									{line}
								</Text>
							))}
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
							{Object.keys(props.body).map((key, index) => {
								// @ts-ignore
								let value = props.body[key];

								if (typeof value === "object") {
									value = "Object";
								}

								const color = COLORS[typeof value];
								value = JSON.stringify(value);

								return (
									<tr key={index}>
										<td>
											<Code
												style={{
													fontSize: "0.9em",
													color: COLORS.key,
													fontFamily: "Jetbrains Mono, sans-serif",
												}}
											>
												{key}
											</Code>
										</td>
										<td>
											<Code
												style={{
													fontSize: "0.9em",
													color: color,
													fontFamily: "Jetbrains Mono, sans-serif",
												}}
											>
												{value}
											</Code>
										</td>
										<td style={{ fontSize: "1em" }}>{metadata.fields[key]}</td>
									</tr>
								);
							})}
						</tbody>
					</Table>
				</div>
				{adapter !== undefined && (
          <div className={styles.extra}>
            <span className={styles.extraTitle}>Extra</span>
            <div className={styles.extraContent}>
              {React.cloneElement(adapter, {data: props.body})}
            </div>
          </div>
        )}
			</main>
		</div>
	);
};

export default Inspector;
