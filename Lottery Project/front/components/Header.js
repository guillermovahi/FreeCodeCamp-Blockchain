import { ConnectButton, connectButton } from "web3uikit";

export default function Header() {
	return (
		<div>
			Decentralized Lottery
			<ConnectButton moralisAuth={false} />
		</div>
	);
}
