import { PrivateKey } from "symbol-sdk";
import { Address, NemFacade, Network, descriptors, models } from "symbol-sdk/nem";

const facade = new NemFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- Build transfer ------------------------------------------------------

const descriptor = new descriptors.TransferTransactionV2Descriptor(
  new Address("TCSMSAMGFNWZVWFTJ34GKIZKYQNDJOVICWIRMVQY"),
  new models.Amount(0n),
  new descriptors.MessageDescriptor(models.MessageType.PLAIN, "Good Luck!"),
  [
    new descriptors.SizePrefixedMosaicDescriptor(
      new descriptors.MosaicDescriptor(
        new descriptors.MosaicIdDescriptor(
          new descriptors.NamespaceIdDescriptor(new TextEncoder().encode("nem")),
          new TextEncoder().encode("xem"),
        ),
        new models.Amount(0n),
      ),
    ),
  ],
);

// v1
// const descriptor = new descriptors.TransferTransactionV1Descriptor(
//   new Address('TCSMSAMGFNWZVWFTJ34GKIZKYQNDJOVICWIRMVQY'),
//   new models.Amount(0n),
//   new descriptors.MessageDescriptor(models.MessageType.PLAIN, 'hello nem')
// );

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100000n, 2 * 3600);

// ---- Sign ------------------------------------------------------

// こういう書き方もできる
// const signature = facade.signTransaction(account.keyPair, transaction);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());

/**
 * bun transfer.ts > payload.json 2> transactionHash.txt
 * curl -X POST -H "Content-Type: application/json" -d @payload.json http://ntn1.dusanjp.com:7890/transaction/announce
 * curl "http://ntn1.dusanjp.com:7890/transaction/get?hash=$(cat transactionHash.txt)"
 */
