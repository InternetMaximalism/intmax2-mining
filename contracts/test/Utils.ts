import { ethers } from "hardhat";
import {
  getRandomBigInt,
  getRandomSalt,
  goldilocksModulus,
} from "../utils/rand";
import { splitSaltTo64BitChunks } from "../utils/conversion";
import { expect } from "chai";

describe("Utils", function () {
  it("should be able to recover salt", async function () {
    for (let i = 0; i < 100; i++) {
      const salt = Array.from(
        { length: 4 },
        () => getRandomBigInt(8) % goldilocksModulus
      );
      const packed = ethers.solidityPacked(
        ["uint64", "uint64", "uint64", "uint64"],
        salt
      );
      const saltChunks = splitSaltTo64BitChunks(packed);
      saltChunks.forEach((chunk, i) => {
        expect(chunk).to.equal(salt[i]);
      });
    }
  });
});
