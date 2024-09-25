import { ethers, upgrades } from "hardhat";
import {
  DummyToken,
  MinterV1,
  MockInt1,
  MockPlonkVerifier,
} from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MinterV1", () => {
  type TestObjects = {
    MinterV1: MinterV1;
    Token: DummyToken;
    Int1: MockInt1;
    ClaimPlonkVerifier: MockPlonkVerifier;
  };

  async function setup(): Promise<TestObjects> {
    const { admin } = await getSigners();

    const MockPlonkVerifierFactory = await ethers.getContractFactory(
      "MockPlonkVerifier"
    );
    const ClaimPlonkVerifier =
      (await MockPlonkVerifierFactory.deploy()) as MockPlonkVerifier;
    const DummyTokenFactory = await ethers.getContractFactory("DummyToken");
    const Token = (await DummyTokenFactory.deploy(
      admin,
      ethers.ZeroAddress
    )) as DummyToken;

    const MockInt1Factory = await ethers.getContractFactory("MockInt1");
    const Int1 = (await MockInt1Factory.deploy()) as MockInt1;

    const MinterV1Factory = await ethers.getContractFactory("MinterV1");
    const MinterV1 = (await upgrades.deployProxy(
      MinterV1Factory,
      [
        await ClaimPlonkVerifier.getAddress(),
        await Token.getAddress(),
        await Int1.getAddress(),
        await admin.getAddress(),
      ],
      { kind: "uups" }
    )) as unknown as MinterV1;

    return { MinterV1, ClaimPlonkVerifier, Token, Int1 };
  }

  type Signers = {
    deployer: HardhatEthersSigner;
    admin: HardhatEthersSigner;
    user: HardhatEthersSigner;
  };
  const getSigners = async (): Promise<Signers> => {
    const [deployer, admin, user] = await ethers.getSigners();
    return {
      deployer,
      admin,
      user,
    };
  };

  it("should deploy", async () => {
    await setup();
  });
});
