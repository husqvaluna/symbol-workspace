import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network } from "symbol-sdk/symbol";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- Build transfer ------------------------------------------------------

const transaction = facade.transactionFactory.create({
  type: "transfer_transaction_v1",
  signerPublicKey: account.publicKey,
  fee: 1000000n, // this means 1.000000 XYM
  deadline: facade.network.fromDatetime(new Date()).addHours(2).timestamp, // 2 hours from now
  recipientAddress: "TARDV42KTAIZEF64EQT4NXT7K55DHWBEFIXVJQY",
  mosaics: [{ mosaicId: 0x72c0212e67a08bcen, amount: 1000000n }],
});

// ---- Sign ------------------------------------------------------

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
