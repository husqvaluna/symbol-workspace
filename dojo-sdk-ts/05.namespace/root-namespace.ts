import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models, generateNamespaceId } from "symbol-sdk/symbol";
import crypto from "node:crypto";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// {
// 	"effectiveRootNamespaceRentalFeePerBlock": "200",
// 	"effectiveChildNamespaceRentalFee": "10000000",
// 	"effectiveMosaicRentalFee": "50000000"
// }

// const effectiveRootNamespaceRentalFeePerBlock = 200;

// const effectiveRootNamespaceRentalFee = rentalBlocks * effectiveRootNamespaceRentalFeePerBlock;
// console.log(effectiveRootNamespaceRentalFee);

// const effectiveChildNamespaceRentalFee = 10000000;
// console.log(effectiveChildNamespaceRentalFee);

// ---- 親ネームスペースの登録 ------------------------------------------------------

const rentalDays = 30; // 最小期間
const rentalBlocks = (rentalDays * 24 * 60 * 60) / 30;

const rootNamespace = "luna" + crypto.randomBytes(4).toString("hex");

const descriptor = new descriptors.NamespaceRegistrationTransactionV1Descriptor(
  new models.NamespaceId(generateNamespaceId(rootNamespace)),
  models.NamespaceRegistrationType.ROOT,
  new models.BlockDuration(BigInt(rentalBlocks)),
  undefined,
  rootNamespace,
);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100, 2 * 3600);

// ---- Sign ------------------------------------------------------

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
