import hre, { ignition } from "hardhat";
import { Int0 } from "../typechain-types";
import Int0Module from "../ignition/modules/Int0";

describe("Int0", function () {
  let int0: Int0;
  this.beforeAll(async function () {
    const { int0: int0_ } = await ignition.deploy(Int0Module);
    int0 = int0_ as unknown as Int0;
  });
});
