import { hashNoPad } from "poseidon-goldilocks";
import {
  combine64BitChunksToBigInt,
  splitBigIntTo32BitChunks,
  splitSaltTo64BitChunks,
} from "./conversion";

export function getPubkeySaltHash(pubkey: bigint, salt: string): string {
  const pubkeyChunks = splitBigIntTo32BitChunks(pubkey);
  const saltChunks = splitSaltTo64BitChunks(salt);
  const inputs = [...pubkeyChunks, ...saltChunks];
  const hashChunks = hashNoPad(inputs);
  const hash = combine64BitChunksToBigInt(hashChunks);
  return "0x" + hash.toString(16).padStart(64, "0");
}
