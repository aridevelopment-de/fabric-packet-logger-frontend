import { ActionIcon, Button, FileButton, Flex, Select } from "@mantine/core";
import { Minimize, WindowMaximize } from "tabler-icons-react";
import Inspector from "../live_logger/Inspector";
import { LogLine } from "../live_logger/LogList";
import styles from "./analyzer.module.css";
import { useAnalyzerData } from "./useAnalyzerData";
import { IBasePacket } from "../../types";

/* Never ever use states for this, as states cause a big performance impact :( */
let data: IBasePacket[] = [];

const Analyzer = () => {
	const [hasLog, selectedPacket, setSelectedPacket] = useAnalyzerData((state) => [
		state.hasLog,
		state.selectedPacket,
		state.setSelectedPacket,
	]);

	return (
		<div className={styles.container}>
			<Meta />

			{hasLog && (
				<div className={styles.content}>
					<div className={styles.loglist}>
						{data.map((item, index) => {
							return (
								<LogLine
                  key={index}
									timestamp={item.timestamp}
									data={item.data}
									selected={index === selectedPacket}
									onClick={() => setSelectedPacket(index === selectedPacket ? null : index)}
								/>
							);
						})}
					</div>
					<Inspector
            data={data}
            selectedPacketId={selectedPacket}
          />
				</div>
			)}
		</div>
	);
};

const Meta = () => {
	const [minimized, hasLog, mapping, logTitle, setMinimized, setHasLog, setMapping, setLogTitle] = useAnalyzerData((state) => [
		state.metaMinimized,
    state.hasLog,
		state.mapping,
		state.logTitle,
    state.setMetaMinimized,
		state.setHasLog,
		state.setMapping,
		state.setLogTitle,
	]);
	return (
		<div className={`${styles.meta} ${minimized ? styles.minimized : ""} ${hasLog ? styles.has_log : ""}`}>
      {minimized ? (
        <ActionIcon onClick={() => setMinimized(false)}>
          <WindowMaximize />
        </ActionIcon>
      ) : (
        <>
          <Flex
            gap="md"
            justify="center"
            align="center"
            direction="row"
            wrap="wrap"
          >
            <input
              placeholder="Name of log"
              aria-label="Name of log"
              value={logTitle}
              onChange={(e) => setLogTitle(e.target.value)}
              style={{ flex: "1 1" }}
            />
            <ActionIcon onClick={() => setMinimized(true)}>
              <Minimize />
            </ActionIcon>
          </Flex>
          <Flex gap="md" justify="center" align="center" direction="row" wrap="wrap">
            <FileButton
              accept="application/json"
              onChange={(file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target === null) {
                    alert("Failed to read file");
                    return;
                  }

                  const d = JSON.parse(e.target.result as string);
                  data = d;
                  setHasLog(true);
                  setLogTitle(file.name);
                };
                reader.readAsText(file);
              }}
            >
              {(props) => (
                <Button style={{ flex: "1 1" }} color="orange" {...props}>
                  Import
                </Button>
              )}
            </FileButton>
            <Button color="green" style={{ flex: "1 1" }} disabled={!hasLog} onClick={() => {
              alert("This is not implemented yet!")
            }}>
              Upload
            </Button>
          </Flex>
          <Select
            label="Current Mapping (WIP)"
            placeholder="Select a mapping"
            data={[
              { value: "yarn", label: "Yarn Mappings" },
              { value: "mojang", label: "Mojang Mappings" },
              { value: "intermediary", label: "Intermediary Mappings" },
            ]}
            disabled
            value={mapping}
            onChange={(value: "yarn" | "mojang" | "intermediary") => setMapping(value)}
          />
        </>
      )}
		</div>
	);
};

export default Analyzer;
