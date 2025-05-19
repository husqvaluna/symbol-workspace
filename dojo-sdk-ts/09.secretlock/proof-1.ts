import { PrivateKey, Hash256, utils } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import { sha3_256 } from "@noble/hashes/sha3";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

const privateKey2 = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const account2 = facade.createAccount(privateKey2);

// ----------------------------------------------------------

const proof = Uint8Array.fromHex("A079AB22EB4B3F9373A2A5BDDFDED1680EE5D9AD");
// const proof = crypto.getRandomValues(new Uint8Array(20))
const secret = sha3_256(proof);

// const proofHex = utils.uint8ToHex(proof)
// const secretHex = utils.uint8ToHex(secret)
// console.debug({ proof, proofHex, secret, secretHex })

// ---- Build transfer ------------------------------------------------------

const descriptor = new descriptors.SecretLockTransactionV1Descriptor(
  account2.address,
  new Hash256(secret),
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(1000000n)),
  new models.BlockDuration(480n),
  models.LockHashAlgorithm.SHA3_256,
);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100, 2 * 3600);

// ---- Sign ------------------------------------------------------

// こういう書き方もできる
// const signature = facade.signTransaction(account.keyPair, transaction);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
