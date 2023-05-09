import { useSession } from "./components/hooks/useSettings";
import { CurrentPage } from "./components/hooks/useSettings";
import Navigation from "./components/navigation/Navigation";
import LiveLogger from "./components/pages/live_logger/LiveLogger";
import Analyzer from './components/pages/analyzer/Analyzer';
import WebsocketHandler from "./WebsocketHandler";
import React from "react";

const SoonComponent = () => {
	return (
		<div style={{ textAlign: "center", marginTop: "50px" }}>
			<h1>Coming soon!</h1>
		</div>
	);
}

const PAGE_TO_COMPONENT = {
	[CurrentPage.LIVE_LOGGER]: <LiveLogger clientVersion="1.19.4" data={[]} />,
  [CurrentPage.ANALYZER]: <Analyzer clientVersion="1.19.4" />,
  [CurrentPage.INTERCEPTOR]: <SoonComponent />,
  [CurrentPage.SEQUENCER]: <SoonComponent />,
  [CurrentPage.COMPARER]: <SoonComponent />,
  [CurrentPage.PACKET_LIST]: <SoonComponent />,
  [CurrentPage.SETTINGS]: <SoonComponent />
} as { [key in CurrentPage]: JSX.Element };

const CustomRouter = (props: {clientVersion: string}) => {
	const page = useSession((state) => state.page);

	return (
    <>
      <Navigation />
			<WebsocketHandler>
				{React.cloneElement(PAGE_TO_COMPONENT[page], {clientVersion: props.clientVersion})}
			</WebsocketHandler>
    </>
	);
};

export default CustomRouter;
