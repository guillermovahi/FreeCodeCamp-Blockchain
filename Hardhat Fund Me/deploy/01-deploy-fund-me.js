// function deployFunc() {
// 	console.log("Hi!");
// }
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
// 	const { getNamedAccounts, deployments } = hre;
// 	// hre.getNamedAccounts
// 	// hre.deployments
// };

const {
	networkConfig,
	developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	let ethUsdPriceFeedAddress;

	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	const args = [ethUsdPriceFeedAddress];
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress], // put price feed addpress
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});
	if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
		await verify(fundMe.address, args);
	}
	log("---------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
