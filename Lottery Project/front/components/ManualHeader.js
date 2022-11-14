import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
	const { enableWeb3, account, isWeb3Enabled, Moralis } = useMoralis();

	useEffect(() => {
		if (isWeb3Enabled) return;
		if (typeof window !== "undefined") {
			if (window.localStorage.getItem("connected")) {
				enableWeb3();
			}
		}
	}, [isWeb3Enabled]);

	useEffect(() => {
		Moralis.onAccountChanged(() => {
			console.log(`Account changed to ${account}`);
			if (account == null) {
				window.localStorage.removeItem("connected");
				deactivateWeb3();
				console.log("Null account found");
			}
		});
	}, []);

	return (
		<div>
			{account ? (
				<div>
					Connected to {account.slice(0, 6)}...{account.slice()}
				</div>
			) : (
				<button
					onClick={async () => {
						await enableWeb3();
						if (typeof windows != "undefined") {
							windows.localStorage.setItem("connected", "injected");
						}
					}}
					disabled={isWeb3EnabledLoading}
				>
					Connect Wallet
				</button>
			)}
		</div>
	);
}
