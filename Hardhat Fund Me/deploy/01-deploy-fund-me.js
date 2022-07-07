// function deployFunc() {
// 	console.log("Hi!");
// }
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
// 	const { getNamedAccounts, deployments } = hre;
// 	// hre.getNamedAccounts
// 	// hre.deployments
// };

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;
};
