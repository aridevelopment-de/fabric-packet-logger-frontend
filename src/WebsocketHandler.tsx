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
  const [whitelistData, blacklistData, onlySaveFiltered] = useSettings((state: SettingsState) => [
    state.whitelistedPackets,
    state.blacklistedPackets,
    state.onlySaveFiltered,
  ]);

  const onMessage = useCallback((event: MessageEvent) => {
    const packetData: IWSSPacket = JSON.parse(event.data);

    if (packetData.id === PacketId.MC_PACKET_RECEIVED) {
      // [packet id, unix milli-timestamp, unique index, networkstate, direction]
      if (!onlySaveFiltered) {
        setData((d) => [
          ...d,
          ...distributeRawPacket(packetData.data),
        ]);

        return;
      } else {
        let packetsToAdd: Array<number>[] = [];

        for (let rawPacket of packetData.data) {
          let shallAdd = true;
          const packetId = rawPacket[0];
          const networkSide = rawPacket[4] === NetworkDirection.CLIENTBOUND ? "cbound" : "sbound";
          const networkState = NetworkStateNames[rawPacket[3]];
          const formattedId = `${networkSide}-${networkState}-0x${packetId.toString(16).padStart(2, "0")}`;

          if (whitelistData.length > 0) {
            if (!whitelistData.includes(formattedId)) {
              shallAdd = false;
            }
          }

          if (blacklistData.length > 0) {
            if (blacklistData.includes(formattedId)) {
              shallAdd = false;
            }
          }

          if (shallAdd) {
            packetsToAdd.push(rawPacket);
          }
        }

        if (packetsToAdd.length === 0) return;
        setData((d) => [
          ...d,
          ...distributeRawPacket(packetsToAdd),
        ]);
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
