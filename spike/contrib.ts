import { sha3_256 } from "js-sha3";
import { Address } from 'symbol-sdk/symbol';
import { intToBytes } from './node_modules/symbol-sdk/src/utils/converter.js';

export function calculateCompositeHash(
  sourceAddress: Address,
  targetAddress: Address,
  scopedKey: bigint,
  targetId: bigint,
  type: number
) {
  const hasher = sha3_256.create();
  hasher.update(sourceAddress.bytes);
  hasher.update(targetAddress.bytes);
  hasher.update(intToBytes(scopedKey, 8));
  hasher.update(intToBytes(targetId, 8));
  hasher.update(Uint8Array.from([type]));
  return hasher.hex();
}
