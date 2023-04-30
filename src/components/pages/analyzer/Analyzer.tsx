import { ActionIcon, Button, FileButton, Flex, Loader, Select, Stack, Text } from "@mantine/core";
import { Minimize, WindowMaximize } from "tabler-icons-react";
import { analyzerDb } from "../../../db/db";
import { useAnalyzerData } from "../../hooks/useAnalyzerData";
import Inspector from "../live_logger/Inspector";
import { LogLine } from "../live_logger/LogList";
import styles from "./analyzer.module.css";
import { IRawPacket } from "../../types";
import { useState } from "react";


const Analyzer = () => {
	const [hasLog, selectedPacket, frontendView, setSelectedPacket] = useAnalyzerData((state) => [
		state.hasLog,
		state.selectedPacket,
    state.frontendView,
		state.setSelectedPacket,
	]);
  const [logLoading, setLogLoading] = useState(false);

	return (
		<div className={styles.container}>
      {logLoading && (
        <div className={styles.loader}>
          <Stack align="center">
            <Loader />
            <Text align="center">
              Processing log... This may take some seconds<br/>depending on the size of the log.
            </Text>
          </Stack>
        </div>
      )}
			<Meta setLogLoading={setLogLoading} />

			{hasLog && (
				<div className={styles.content}>
					<div className={styles.loglist}>
						{frontendView.map((item) => {
							return (
								<LogLine
                  key={item.index}
									data={{
                    id: item.id,
                    timestamp: item.timestamp,
                    index: item.index!,
                    networkState: item.networkState,
                    direction: item.direction,
                  }}
									selected={selectedPacket !== null && item.index === selectedPacket.index}
									onClick={async () => {
                    const record = await analyzerDb.getRecord(item.index!);

                    if (record === undefined) {
                      // TODO: User feedback
                      throw new Error("Record not found");
                    }

                    if (selectedPacket === null) {
                      setSelectedPacket(record);
                      return;
                    }

                    if (selectedPacket.index === item.index) {
                      setSelectedPacket(null);
                      return;
                    }

                    setSelectedPacket(record);
                  }}
                  body={selectedPacket === null ? null : selectedPacket.data}
								/>
							);
						})}
					</div>
					<Inspector
            rawSelected={selectedPacket as any as IRawPacket}
            body={selectedPacket === null ? null : selectedPacket.data}
          />
				</div>
			)}
		</div>
	);
};

const Meta = (props: {setLogLoading: Function}) => {
	const [minimized, hasLog, mapping, logTitle, setMinimized, setHasLog, setMapping, setLogTitle, setFrontendView, setSelectedPacket] = useAnalyzerData((state) => [
		state.metaMinimized,
    state.hasLog,
		state.mapping,
		state.logTitle,
    state.setMetaMinimized,
		state.setHasLog,
		state.setMapping,
		state.setLogTitle,
    state.setFrontendView,
    state.setSelectedPacket,
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

                  setSelectedPacket(null);
                  setHasLog(false);
                  setFrontendView([]);
                  props.setLogLoading(true);

                  const d = JSON.parse(e.target.result as string);

                  analyzerDb.clear().then(() => analyzerDb.addBulkJson(d).then(() => {
                    analyzerDb.generateFrontViewData().then((data) => {
                      props.setLogLoading(false);
                      setFrontendView(data);
                      setHasLog(true);
                    });
                  }));

                  setLogTitle(file.name);
                };
                reader.readAsText(file);
              }}
            >
              {(props) => (
                <Button style={{ flex: "1 1" }} color="green" {...props}>
                  Import
                </Button>
              )}
            </FileButton>
            <Button color="red" style={{ flex: "1 1" }} disabled={!hasLog} onClick={() => {
              setLogTitle("");
              setHasLog(false);
              setFrontendView([]);
              analyzerDb.clear();
            }}>
              Clear
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
