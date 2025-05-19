import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, metadataGenerateKey, metadataUpdateValue } from "symbol-sdk/symbol";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- アカウントメタデータの設定 ------------------------------------------------------

const key = metadataGenerateKey("codename");

const valueContent = "combat Echizen";
const value = new TextEncoder().encode(valueContent);
const valueSize = value.length;

// 更新する場合は直前の値を指定する必要がある。
// 初会の値を指定する場合は、空文字列でよい。
const oldValueContent = "";
const oldValue = new TextEncoder().encode(oldValueContent);
const oldValueSize = oldValue.length;

const descriptor1 = new descriptors.AccountMetadataTransactionV1Descriptor(
  account.address,
  key,
  valueSize - oldValueSize,
  metadataUpdateValue(oldValue, value),
);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [descriptor1].map((descriptor) =>
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor, account.publicKey),
);

const descriptor = new descriptors.AggregateCompleteTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions,
);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100, 2 * 3600);

// ---- Sign ------------------------------------------------------

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
