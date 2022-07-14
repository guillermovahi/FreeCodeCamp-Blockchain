import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

//* Function to connect metamask with the web
async function connect() {
	if (typeof window.ethereum !== 'undefined') {
		console.log('I see a metamask');
		try {
			await window.ethereum.request({ method: 'eth_requestAccounts' });
		} catch (error) {
			console.log(error);
		}
		console.log(
			'You have successfully connected with your metamask account'
		);
		connectButton.innerHTML = 'Connected';
	} else {
		console.log('No metamask');
	}
}

async function getBalance() {
	if (typeof window.ethereum != 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		console.log(
			`The contract balance is: ${ethers.utils.formatEther(balance)}`
		);
	}
}

async function fund() {
	const ethAmount = document.getElementById('ethAmount').value;
	console.log(`Funding with ${ethAmount}`);
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		//console.log(signer);
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			});
			await listenForTransactionMine(transactionResponse, provider);
			console.log('Done!');
		} catch (error) {
			console.log(error);
		}
	}
}

function listenForTransactionMine(transactionResponse, provider) {
	console.log(`Mining ${transactionResponse.hash}...`);
	return new Promise((resolve, reject) => {
		provider.once(transactionResponse.hash, (transactionReceipt) => {
			console.log(
				`Completed with ${transactionReceipt.confirmations} confirmartions`
			);
			resolve();
		});
	});
}

async function withdraw() {
	if (typeof window.ethereum !== 'undefined') {
		console.log('Withdrawing...');
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transactionResponse = await contract.withdraw();
			await listenForTransactionMine(transactionResponse, provider);
		} catch (error) {
			console.log(error);
		}
	}
}
