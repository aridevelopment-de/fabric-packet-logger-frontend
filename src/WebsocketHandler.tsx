import React, { useCallback, useEffect, useState } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { SettingsState, useSession, useSettings } from "./components/hooks/useSettings";
import EventHandler, { EventType } from './utils/eventhandler';
import { IRawPacket, IWSSPacket, NetworkDirection, NetworkStateNames, PacketId } from "./components/types";

const distributeRawPacket = (data: Array<number>[]): IRawPacket[]  => {
  return data.map((d) => {
    return {
      id: d[0],
      timestamp: d[1],
      index: d[2],
      networkState: d[3],
      direction: d[4]
    } as IRawPacket;
  });
}

const WebsocketHandler = (props: { children: JSX.Element }) => {
	const [data, setData] = useState<IRawPacket[]>([]);
	const [ws, setWs, setConnected] = useSession((state) => [
		state.ws,
		state.setWs,
		state.setConnected,
	]);
  const [whitelist, blacklist] = useSettings((state) => [state.whitelistedPackets, state.blacklistedPackets]);

  const onMessage = useCallback((event: MessageEvent) => {
    const packetData: IWSSPacket = JSON.parse(event.data);

    if (packetData.id === PacketId.MC_PACKET_RECEIVED) {
      // [packet id, unix milli-timestamp, unique index, networkstate, direction]
      setData((d) => [
        ...d,
        ...distributeRawPacket(packetData.data),
      ]);

      return;
    }
  }, []);

  useEffect(() => {
		if (ws) {
			ws.addEventListener("message", onMessage);
			return () => {
				ws.removeEventListener("message", onMessage);
			};
		}
	}, [ws, onMessage]);

  const sendWhiteBlackList = useCallback(() => {
    ws!.send(JSON.stringify({
      id: PacketId.WHITE_BLACK_LIST_CHANGE,
      data: {
        whitelist,
        blacklist
      }
    }));
  }, [ws, whitelist, blacklist]);

  useEffect(() => {
    // whitelist / blacklist
    if (ws !== null) {
      ws.addEventListener("open", sendWhiteBlackList);
    }

    return () => {
      if (ws !== null) {
        ws.removeEventListener("open", sendWhiteBlackList);
      }
    }
  }, [ws, sendWhiteBlackList]);

  useEffect(() => {
    const port = new URLSearchParams(document.location.search).get("wssPort") || "1337";
    const ws = new ReconnectingWebSocket("ws://localhost:" + port);
    setWs(ws);

    ws.onopen = () => {
      console.info("Connected to server");
      setConnected(true);
    }

    ws.onclose = () => {
      console.info("Disconnected from server");
      setConnected(false);
      EventHandler.emit(EventType.DATA_CLEAR);
    }

    return () => {
      ws.close();
    }
  }, [setConnected, setWs]);

  useEffect(() => {
    EventHandler.on(EventType.DATA_CLEAR, "websocket-handler", () => {
      setData([]);
      
      if (ws !== null) {
        ws.send(JSON.stringify({
          id: PacketId.REQUEST_CLEAR,
          data: null,
        }));
      }
    });
    
    return () => {
      EventHandler.off(EventType.DATA_CLEAR, "websocket-handler");
    }
  });

	return React.cloneElement(props.children, { data });
};

export default WebsocketHandler;
