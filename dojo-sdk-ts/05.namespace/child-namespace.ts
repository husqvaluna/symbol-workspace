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

// ---- 子ネームスペースの登録 ------------------------------------------------------

const rootNamespace = "luna";
const parentNamespaceId = generateNamespaceId(rootNamespace); // 紐づけたいルートネームスペース
const childNamespace = crypto.randomBytes(2).toString("hex"); // 作成するサブネームスペース

const descriptor = new descriptors.NamespaceRegistrationTransactionV1Descriptor(
  // Txタイプ:ネームスペース登録Tx
  new models.NamespaceId(generateNamespaceId(childNamespace, parentNamespaceId)), // ネームスペースID
  models.NamespaceRegistrationType.CHILD, // 登録タイプ : サブネームスペース
  undefined, // duration:レンタル期間 (サブの場合は省略可)
  new models.NamespaceId(parentNamespaceId),
  childNamespace, // ネームスペース
);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100, 2 * 3600);

// ---- Sign ------------------------------------------------------

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
