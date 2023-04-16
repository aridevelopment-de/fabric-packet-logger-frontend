import { useState, useEffect, useCallback } from 'react';
import { IBasePacket } from "./components/types";
import { SettingsState, useSession, useSettings } from "./components/hooks/useSettings";
import React from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import EventHandler, { EventType } from './utils/eventhandler';
const WebsocketHandler = (props: { children: JSX.Element }) => {
	const [data, setData] = useState<IBasePacket[]>([]);
	const [ws, setWs, setConnected, setRegisteredPackets, setPacketDescriptions] = useSession((state) => [
		state.ws,
		state.setWs,
		state.setConnected,
		state.setRegisteredPackets,
		state.setPacketDescriptions,
	]);
  const [whitelistData, blacklistData, onlySaveFiltered] = useSettings((state: SettingsState) => [
    state.whitelistedPackets,
    state.blacklistedPackets,
    state.onlySaveFiltered,
  ]);

  const onMessage = useCallback((event: MessageEvent) => {
    const packetData = JSON.parse(event.data);

    if (packetData.type === "packet") {
      if (!onlySaveFiltered) {
        setData((d) => [
          ...d,
          {
            timestamp: Date.now(),
            data: packetData,
          },
        ]);

        return;
      } else {
        let shallAdd = true;

        if (whitelistData.length > 0) {
          if (!whitelistData.includes(packetData.id)) {
            shallAdd = false;
          }
        }

        if (blacklistData.length > 0) {
          if (blacklistData.includes(packetData.id)) {
            shallAdd = false;
          }
        }

        if (shallAdd) {
          setData((d) => [
            ...d,
            {
              timestamp: Date.now(),
              data: packetData,
            },
          ]);
        }
      }
    }
  }, [onlySaveFiltered, whitelistData, blacklistData]);

  useEffect(() => {
		if (ws) {
			ws.addEventListener("message", onMessage);
			return () => {
				ws.removeEventListener("message", onMessage);
			};
		}
	}, [ws, onMessage]);

  useEffect(() => {
    const port = new URLSearchParams(document.location.search).get("wssPort") || "1337";
    const ws = new ReconnectingWebSocket("ws://localhost:" + port);

    ws.onopen = () => {
      console.info("Connected to server");
      setConnected(true);
      setWs(ws);
    }

    ws.onclose = () => {
      console.info("Disconnected from server");
      setConnected(false);
    }

    ws.addEventListener("message", (event) => {
      const d = JSON.parse(event.data);

      if (d.type === "init") {
        setRegisteredPackets(d.allPackets);
        setPacketDescriptions(d.descriptions);

        console.log(d.allPackets);
      }
    });

    return () => {
      ws.close();
    }
  }, [setConnected, setWs, setRegisteredPackets, setPacketDescriptions]);

  useEffect(() => {
    EventHandler.on(EventType.DATA_CLEAR, "websocket-handler", () => setData([]));
    
    return () => {
      EventHandler.off(EventType.DATA_CLEAR, "websocket-handler");
    }
  });

	return React.cloneElement(props.children, { data });
};

export default WebsocketHandler;
