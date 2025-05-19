# エラーを監視する

アカウントに関するエラーを監視してキャッチする。実装の参考ドキュメント。

- [新しいブロックの監視 — Symbol Documentation](https://docs.symbol.dev/ja/guides/blockchain/listening-new-blocks.html#method-01-using-websockets)

`monitor.ts`として次の内容を作成する。

[monitor.ts](./monitor.ts)

アカウント`TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI`のステータスが流れてくるストリームの購読を開始する。

```shell
$ bun monitor.ts
Connection opened
{
  uid: "TFWURWRAQ67RYCW44UZRT3QRUZCWET5K",
}
```

この状態で、前述のトランザクションのコードで、例えば残高を超えるXYMの送信トランザクションを作成し、送信してみる。
送信するために、`monitor.ts`とは別のコンソールを立ち上げて、実行する。

```ts
// 送信量を9,000XYMへ書き換える。
  mosaics: [
    { mosaicId: 0x72C0212E67A08BCEn, amount: 9000n * 1000000n }
  ]
```

送信すると、

```shell
$ bun sending_a_transaction.ts > payload.json
$ curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions
{"message":"packet 9 was pushed to the network via /transactions"}

// ---- 以下、monitor.tsを実行中のコンソール

{
  topic: "status/TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI",
  data: {
    hash: "E92702FE716F7BA91B77B7A1E46AB84BC4040FCDABB9B0F0D5A096A37FEACF26",
    code: "Failure_Core_Insufficient_Balance",
    deadline: "71247615572",
  },
}
```

`Failure_Core_Insufficient_Balance`（残高不足）というエラーメッセージが流れてくる。

RESTが返すステータスの定義コード。

- [symbol/client/rest/src/catapult\-sdk/model/status\.js at 10c09a2ac1b26fcb29e23ed9e911c9d123678d11 · symbol/symbol](https://github.com/symbol/symbol/blob/10c09a2ac1b26fcb29e23ed9e911c9d123678d11/client/rest/src/catapult-sdk/model/status.js#L25)

他の購読のためのチャネル名の参考コード。

- [symbol\-sdk\-typescript\-javascript/src/infrastructure/Listener\.ts at 1162c1cb7c4c73cef6d770c0ffbac8131b3a3d24 · symbol/symbol\-sdk\-typescript\-javascript](https://github.com/symbol/symbol-sdk-typescript-javascript/blob/1162c1cb7c4c73cef6d770c0ffbac8131b3a3d24/src/infrastructure/Listener.ts#L40)


## ブラウザで確認できるようにした

- [WebSocket Client](https://golden-kashata-3da795.netlify.app/)

前述のコードをブラウザで動くように加筆修正。
アドレスをいれて、「Connect」ボタンを押下すれば購読が始まる。（Chromeでしか動作確認してない）
とりあえずコンソールを使わなくても見れる程度の代物。
