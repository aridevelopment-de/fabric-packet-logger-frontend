import { useSession } from "./components/hooks/useSettings";
import { CurrentPage } from "./components/hooks/useSettings";
import Navigation from "./components/navigation/Navigation";
import LiveLogger from "./components/pages/live_logger/LiveLogger";
import Analyzer from './components/pages/analyzer/Analyzer';
import WebsocketHandler from "./WebsocketHandler";

const SoonComponent = () => {
	return (
		<div style={{ textAlign: "center", marginTop: "50px" }}>
			<h1>Coming soon!</h1>
		</div>
	);
}

const PAGE_TO_COMPONENT = {
	[CurrentPage.LIVE_LOGGER]: <LiveLogger data={[]} />,
  [CurrentPage.ANALYZER]: <Analyzer />,
  [CurrentPage.INTERCEPTOR]: <SoonComponent />,
  [CurrentPage.SEQUENCER]: <SoonComponent />,
  [CurrentPage.COMPARER]: <SoonComponent />,
  [CurrentPage.PACKET_LIST]: <SoonComponent />,
  [CurrentPage.SETTINGS]: <SoonComponent />
} as { [key in CurrentPage]: JSX.Element };

const CustomRouter = () => {
	const page = useSession((state) => state.page);

	return (
    <>
      <Navigation />
			<WebsocketHandler>
				{PAGE_TO_COMPONENT[page]}
			</WebsocketHandler>
    </>
	);
};

export default CustomRouter;
