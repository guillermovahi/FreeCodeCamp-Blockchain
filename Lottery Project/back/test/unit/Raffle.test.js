const { assert, expect } = require('chai');
const { getNamedAccounts, deployments, ethers, network } = require('hardhat');
const { developmentChains, networkConfig } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
	? describe.skip
	: describe('Raffle Unit Tests', function () {
			let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval;
			const chainId = network.config.chainId;

			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['all']);
				raffle = await ethers.getContract('Raffle', deployer);
				vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer);
				raffleEntranceFee = await raffle.getEntranceFee();
				interval = await raffle.getInterval();
			});

			describe('constructor', function () {
				it('Initializes the raffle correctly', async function () {
					const raffleState = await raffle.getRaffleState();
					assert.equal(raffleState.toString(), '0');
					assert.equal(interval.toString(), networkConfig[chainId]['interval']);
				});
			});

			describe('enterRaffle', function () {
				it("Reverts when you don't pay enough", async function () {
					await expect(raffle.enterRaffle()).to.be.revertedWith(
						'Raffle__NotEnoughETHEntered'
					);
				});
				it('Records players when thery enter', async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					const playerFromContract = await raffle.getPlayer(0);
					assert.equal(playerFromContract, deployer);
				});
				it('Emits event on enter', async function () {
					await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
						raffle,
						'RaffleEnter'
					);
				});
				it("Doesn't allow entrance when raffle is calculating", async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
					await raffle.performUpkeep([]);
					await expect(
						raffle.enterRaffle({ value: raffleEntranceFee })
					).to.be.revertedWith('Raffle__NotOpen');
				});
			});
			describe('checkUpKeep', function () {
				it("Returns false if people haven't sent any ETH", async function () {
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
					const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
					assert(!upkeepNeeded);
				});
				it("Returns false if raffle isn't open", async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
					await raffle.performUpkeep([]);
					const raffleState = await raffle.getRaffleState();
					const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
					assert.equal(raffleState.toString(), '1');
					assert.equal(upkeepNeeded, false);
				});
				it("Returns false if enough time hasn't passed", async () => {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() - 1]);
					await network.provider.request({ method: 'evm_mine', params: [] });
					const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x'); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
					assert(!upkeepNeeded);
				});
				it('Returns true if enough time has passed, has players, eth, and is open', async () => {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.request({ method: 'evm_mine', params: [] });
					const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x'); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
					assert(upkeepNeeded);
				});
			});
			describe('performUpKeep', function () {
				it('It can only run if checkUpkeep is true', async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
					const tx = await raffle.performUpkeep([]);
					assert(tx);
				});
				it('Reverts when checkUpkeep is false', async function () {
					await expect(raffle.performUpkeep([])).to.be.revertedWith(
						'Raffle__UpkeepNotNeeded'
					);
				});
				it('Updates the raffle state, emits and event, and calls the vrf coordinator', async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
					const txResponse = await raffle.performUpkeep([]);
					const txReceipt = await txResponse.wait(1);
					const requestId = txReceipt.events[1].args.requestId;
					const raffleState = await raffle.getRaffleState();
					assert(requestId.toNumber() > 0);
					assert(raffleState.toString() == '1');
				});
			});
			describe('fulfillRandomWords', function () {
				beforeEach(async function () {
					await raffle.enterRaffle({ value: raffleEntranceFee });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
					await network.provider.send('evm_mine', []);
				});
				it('Can only be called after performUpkeep', async function () {
					await expect(
						vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
					).to.be.revertedWith('nonexistent request');
					await expect(
						vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
					).to.be.revertedWith('nonexistent request');
				});
				it('Picks a winner, resets the lottery, and sends money', async function () {
					const additionalEntrants = 3;
					const startingAccountIndex = 1;
					const accounts = await ethers.getSigners();
					for (
						let i = startingAccountIndex;
						i < startingAccountIndex + additionalEntrants;
						i++
					) {
						const accountConnectedRaffle = raffle.connect(accounts[i]);
						await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee });
					}
					const staringTimeStamp = await raffle.getLatestTimeStamp();
					await new Promise(async (resolve, reject) => {
						raffle.once('WinnerPicked', async () => {
							console.log('Found the event!');
							try {
								const recentWinner = await raffle.getRecentWinner();
								const raffleState = await raffle.getRaffleState();
								const endingTimeStamp = await raffle.getLatestTimeStamp();
								const numPlayers = await raffle.getNumberOfPlayers();
								const winnerEndingBalance = await accounts[1].getBalance();
								assert.equal(numPlayers.toString(), '0');
								assert.equal(raffleState.toString(), '0');
								assert(endingTimeStamp > staringTimeStamp);

								assert.equal(
									winnerEndingBalance.toString(),
									winnerStartingBalance.add(
										raffleEntranceFee
											.mul(additionalEntrants)
											.add(raffleEntranceFee)
											.toString()
									)
								);
							} catch (e) {
								reject(e);
							}
							resolve();
						});

						const tx = await raffle.performUpkeep([]);
						const txReceipt = await tx.wait(1);
						const winnerStartingBalance = await accounts[1].getBalance();
						await vrfCoordinatorV2Mock.fulfillRandomWords(
							txReceipt.events[1].args.requestId,
							raffle.address
						);
					});
				});
			});
	  });
