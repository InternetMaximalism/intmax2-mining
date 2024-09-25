import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Int1, MockPlonkVerifier } from "../../typechain-types";
import { getDepositHash } from "./common.test";

describe("Int1", () => {
  type TestObjects = {
    Int1: Int1;
    WithdrawalVerifier: MockPlonkVerifier;
  };

  async function setup(): Promise<TestObjects> {
    const { analyzer, admin } = await getSigners();

    const MockPlonkVerifierFactory = await ethers.getContractFactory(
      "MockPlonkVerifier"
    );
    const WithdrawalVerifier =
      (await MockPlonkVerifierFactory.deploy()) as MockPlonkVerifier;

    const Int1Factory = await ethers.getContractFactory("Int1");
    const Int1 = (await upgrades.deployProxy(
      Int1Factory,
      [await WithdrawalVerifier.getAddress(), await admin.getAddress()],
      { kind: "uups" }
    )) as unknown as Int1;

    // grant roles
    await Int1.connect(admin).grantRole(
      await Int1.ANALYZER(),
      await analyzer.getAddress()
    );

    return {
      Int1,
      WithdrawalVerifier,
    };
  }

  type Signers = {
    deployer: HardhatEthersSigner;
    admin: HardhatEthersSigner;
    analyzer: HardhatEthersSigner;
    user: HardhatEthersSigner;
  };
  const getSigners = async (): Promise<Signers> => {
    const [deployer, admin, analyzer, user] = await ethers.getSigners();
    return {
      deployer,
      admin,
      analyzer,
      user,
    };
  };

  describe("initialize", () => {
    describe("success", () => {
      it("admin has admin role", async () => {
        const { Int1 } = await loadFixture(setup);
        const { admin } = await getSigners();
        const role = await Int1.DEFAULT_ADMIN_ROLE();
        expect(await Int1.hasRole(role, admin.address)).to.be.true;
      });
      it("analyzer has analyzer role", async () => {
        const { Int1 } = await loadFixture(setup);
        const { analyzer } = await getSigners();
        const role = await Int1.ANALYZER();
        expect(await Int1.hasRole(role, analyzer.address)).to.be.true;
      });
    });

    describe("fail", () => {
      it("should revert when initializing twice", async () => {
        const { Int1 } = await loadFixture(setup);

        await expect(
          Int1.initialize(ethers.ZeroAddress, ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(Int1, "InvalidInitialization");
      });
    });
  });

  describe("depositNativeToken", () => {
    describe("success", () => {
      it("emit Deposited event", async () => {
        const { Int1 } = await loadFixture(setup);
        const { user } = await getSigners();
        const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
        const depositAmount = ethers.parseEther("1");

        const currentDepositId = await Int1.getLastDepositId();
        const currentTimestamp = await ethers.provider.getBlock("latest");

        await expect(
          Int1.connect(user).depositNativeToken(recipientSaltHash, {
            value: depositAmount,
          })
        )
          .to.emit(Int1, "Deposited")
          .withArgs(
            currentDepositId + 1n,
            user.address,
            recipientSaltHash,
            0, // tokenIndex for ETH should be 0
            depositAmount,
            currentTimestamp!.timestamp + 1
          );
      });
    });

    it("transfer eth", async () => {
      const { Int1 } = await loadFixture(setup);
      const { user } = await getSigners();
      const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const depositAmountEther = "1";
      const depositAmount = ethers.parseEther(depositAmountEther);

      const initialBalance = await ethers.provider.getBalance(
        await Int1.getAddress()
      );
      await Int1.connect(user).depositNativeToken(recipientSaltHash, {
        value: depositAmount,
      });
      const finalBalance = await ethers.provider.getBalance(
        await Int1.getAddress()
      );

      expect(finalBalance - initialBalance).to.equal(depositAmount);
    });
  });

  describe("fail", () => {
    it("revert RecipientSaltHashAlreadyUsed", async () => {
      const { Int1 } = await loadFixture(setup);
      const { user } = await getSigners();
      const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const depositAmount = ethers.parseEther("1");
      await Int1.connect(user).depositNativeToken(recipientSaltHash, {
        value: depositAmount,
      });

      await expect(
        Int1.connect(user).depositNativeToken(recipientSaltHash, {
          value: depositAmount,
        })
      ).to.be.revertedWithCustomError(Int1, "RecipientSaltHashAlreadyUsed");

      it("revert TriedToDepositZero", async () => {
        const { Int1 } = await loadFixture(setup);
        const { user } = await getSigners();
        const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

        await expect(
          Int1.connect(user).depositNativeToken(recipientSaltHash, { value: 0 })
        ).to.be.revertedWithCustomError(Int1, "TriedToDepositZero");
      });
    });
  });

  describe("analyzeAndProcessDeposits", () => {
    it("emit DepositsAnalyzedAndProcessed event", async () => {
      const { Int1 } = await loadFixture(setup);
      const { analyzer, user } = await getSigners();

      // Create some deposits using ETH
      const depositAmount = ethers.parseEther("1");

      for (let i = 0; i < 5; i++) {
        const recipientSaltHash = ethers.keccak256(
          ethers.toUtf8Bytes(`test${i}`)
        );
        await Int1.connect(user).depositNativeToken(recipientSaltHash, {
          value: depositAmount,
        });
      }

      const upToDepositId = 5;
      const rejectDepositIds: number[] = [2, 4];

      const depositHash0 = getDepositHash(
        ethers.keccak256(ethers.toUtf8Bytes("test0")),
        0,
        depositAmount
      );

      const depositHash2 = getDepositHash(
        ethers.keccak256(ethers.toUtf8Bytes("test2")),
        0,
        depositAmount
      );

      const depositHash4 = getDepositHash(
        ethers.keccak256(ethers.toUtf8Bytes("test4")),
        0,
        depositAmount
      );

      await expect(
        Int1.connect(analyzer).analyzeAndProcessDeposits(
          upToDepositId,
          rejectDepositIds
        )
      )
        .to.emit(Int1, "DepositsAnalyzedAndProcessed")
        .withArgs(upToDepositId, rejectDepositIds, [
          depositHash0,
          depositHash2,
          depositHash4,
        ]);
    });

    describe("fail", () => {
      it("only analyzer", async () => {
        const { Int1 } = await loadFixture(setup);
        const { user } = await getSigners();
        const upToDepositId = 5;
        const rejectDepositIds: number[] = [2, 4];

        await expect(
          Int1.connect(user).analyzeAndProcessDeposits(
            upToDepositId,
            rejectDepositIds
          )
        )
          .to.be.revertedWithCustomError(
            Int1,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(user.address, await Int1.ANALYZER());
      });
    });

    describe("cancelDeposit", () => {
      type TestObjectsForDepositERC20 = TestObjects & {
        depositAmount: bigint;
        recipientSaltHash: string;
        depositId: bigint;
      };
      const setupCancelDeposit =
        async (): Promise<TestObjectsForDepositERC20> => {
          const testObjects = await loadFixture(setup);
          const { user } = await getSigners();
          const depositAmount = ethers.parseEther("1");
          const recipientSaltHash = ethers.keccak256(
            ethers.toUtf8Bytes("test")
          );
          await testObjects.Int1.connect(user).depositNativeToken(
            recipientSaltHash,
            { value: depositAmount }
          );
          const depositId = await testObjects.Int1.getLastDepositId();
          return {
            ...testObjects,
            depositAmount,
            recipientSaltHash,
            depositId,
          };
        };

      describe("success", () => {
        describe("send token", () => {
          it("native token", async () => {
            const { Int1, depositAmount, recipientSaltHash, depositId } =
              await loadFixture(setupCancelDeposit);
            const { user } = await getSigners();
            const initialBalance = await ethers.provider.getBalance(
              user.address
            );

            const tx = await Int1.connect(user).cancelDeposit(depositId, {
              recipientSaltHash,
              tokenIndex: 0,
              amount: depositAmount,
            });
            const receipt = await tx.wait();
            const gasCost = receipt!.gasUsed * receipt!.gasPrice;

            const finalBalance = await ethers.provider.getBalance(user.address);
            expect(finalBalance - initialBalance + gasCost).to.equal(
              depositAmount
            );
          });

          it("emit DepositCanceled event", async () => {
            const { Int1, depositAmount, recipientSaltHash, depositId } =
              await loadFixture(setupCancelDeposit);
            const { user } = await getSigners();

            await expect(
              Int1.connect(user).cancelDeposit(depositId, {
                recipientSaltHash,
                tokenIndex: 0,
                amount: depositAmount,
              })
            )
              .to.emit(Int1, "DepositCanceled")
              .withArgs(depositId);
          });
          it("can rejected deposit", async () => {
            const { Int1, depositAmount, recipientSaltHash, depositId } =
              await loadFixture(setupCancelDeposit);
            const { user, analyzer } = await getSigners();

            await Int1.connect(analyzer).analyzeAndProcessDeposits(depositId, [
              depositId,
            ]);
            await expect(
              Int1.connect(user).cancelDeposit(depositId, {
                recipientSaltHash,
                tokenIndex: 0,
                amount: depositAmount,
              })
            )
              .to.emit(Int1, "DepositCanceled")
              .withArgs(depositId);
          });
          it("can deposit not analyzed amount", async () => {
            const { Int1, depositAmount, depositId } = await loadFixture(
              setupCancelDeposit
            );
            const { user, analyzer } = await getSigners();

            await Int1.connect(analyzer).analyzeAndProcessDeposits(depositId, [
              depositId,
            ]);

            const recipientSaltHash2 = ethers.keccak256(
              ethers.toUtf8Bytes("test2")
            );
            await Int1.connect(user).depositNativeToken(recipientSaltHash2, {
              value: depositAmount,
            });
            const nextDepositId = depositId + 1n;
            await expect(
              Int1.connect(user).cancelDeposit(nextDepositId, {
                recipientSaltHash: recipientSaltHash2,
                tokenIndex: 0,
                amount: depositAmount,
              })
            )
              .to.emit(Int1, "DepositCanceled")
              .withArgs(nextDepositId);
          });
        });
      });

      describe("fail", () => {
        it("revert OnlySenderCanCancelDeposit", async () => {
          const { Int1, depositAmount, recipientSaltHash, depositId } =
            await loadFixture(setupCancelDeposit);
          const { analyzer } = await getSigners();

          await expect(
            Int1.connect(analyzer).cancelDeposit(depositId, {
              recipientSaltHash,
              tokenIndex: 0,
              amount: depositAmount,
            })
          ).to.be.revertedWithCustomError(Int1, "OnlySenderCanCancelDeposit");
        });
        it("revert InvalidDepositHash", async () => {
          const { Int1, depositAmount, depositId } = await loadFixture(
            setupCancelDeposit
          );
          const { user } = await getSigners();

          const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
          const depositData = await Int1.getDepositData(depositId);
          const wrongDepositHash = getDepositHash(wrongHash, 0, depositAmount);

          await expect(
            Int1.connect(user).cancelDeposit(depositId, {
              recipientSaltHash: wrongHash,
              tokenIndex: 0,
              amount: depositAmount,
            })
          )
            .to.be.revertedWithCustomError(Int1, "InvalidDepositHash")
            .withArgs(depositData.depositHash, wrongDepositHash);
        });
        it("rejects duplicate cancel deposit", async () => {
          const { Int1, depositAmount, recipientSaltHash, depositId } =
            await loadFixture(setupCancelDeposit);
          const { user } = await getSigners();

          await Int1.connect(user).cancelDeposit(depositId, {
            recipientSaltHash,
            tokenIndex: 0,
            amount: depositAmount,
          });

          await expect(
            Int1.connect(user).cancelDeposit(depositId, {
              recipientSaltHash,
              tokenIndex: 0,
              amount: depositAmount,
            })
          ).to.be.revertedWithCustomError(Int1, "OnlySenderCanCancelDeposit");
        });
        it("cannot not rejected deposit", async () => {
          const { Int1, depositAmount, recipientSaltHash, depositId } =
            await loadFixture(setupCancelDeposit);
          const { user, analyzer } = await getSigners();
          await Int1.connect(analyzer).analyzeAndProcessDeposits(depositId, []);
          await expect(
            Int1.connect(user).cancelDeposit(depositId, {
              recipientSaltHash,
              tokenIndex: 0,
              amount: depositAmount,
            })
          ).to.be.revertedWithCustomError(Int1, "AlreadyAnalyzed");
        });
      });
    });
  });

  describe("getLastProcessedDepositId, getLastDepositId", () => {
    it("get DepositId", async () => {
      const { Int1 } = await loadFixture(setup);
      const { analyzer, user } = await getSigners();

      expect(await Int1.getLastProcessedDepositId()).to.equal(0);
      expect(await Int1.getLastDepositId()).to.equal(0);

      // Create some deposits using ETH
      const depositAmount = ethers.parseEther("1");

      for (let i = 0; i < 5; i++) {
        const recipientSaltHash = ethers.keccak256(
          ethers.toUtf8Bytes(`test${i}`)
        );
        await Int1.connect(user).depositNativeToken(recipientSaltHash, {
          value: depositAmount,
        });
      }

      expect(await Int1.getLastProcessedDepositId()).to.equal(0);
      expect(await Int1.getLastDepositId()).to.equal(5);

      await Int1.connect(analyzer).analyzeAndProcessDeposits(3, []);

      expect(await Int1.getLastProcessedDepositId()).to.equal(3);
      expect(await Int1.getLastDepositId()).to.equal(5);
    });
  });
});
