# トランスファートランザクションの送信

ブロックチェーンに記録する何らかの操作（トランザクション）を実行するには、
トランザクションオブジェクトを作り、それに対して署名を行い、署名済みトランザクションを作成するのが基本。


## トランザクションオブジェクト作成

基幹通過であるXYMを別のアカウントへ転送するトランザクションを実行してみる。
READMEに書いてある内容を参考に、トランザクションペイロードを作る。

- [symbol/sdk/javascript at main · symbol/symbol](https://github.com/symbol/symbol/tree/main/sdk/javascript#sending-a-transaction)

秘密鍵は前述で作ったもので置き換え、
宛先のアカウントには色々投げ込まれているようなので、そのまま使う。

- [Symbol Block Explorer](https://testnet.symbol.fyi/accounts/TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I)

Node環境でのコードを実行を試す。
一部、書き換えが必要だったので、コメントを入れている。

[with-name.ts](./with-name.ts)


### より型堅牢なトランザクションオブジェクト作成

[with-descriptor.ts](./with-descriptor.ts)

文字列による指定`type: 'transfer_transaction_v1',`を排除でき、有効期限も現時点からの秒数を指定するだけでよくなる。
また、具体的なトランザクションごとのディスクリプタの定義と、トランザクション共通の定義の処理を分離できるコードになる。


## 署名済みトランザクションを作成

コードを実行して、ペイロードとトランザクションハッシュをファイルとして保存する。

```shell
$ bun with-descriptor.ts > payload.json 2> transactionHash.txt
$ cat payload.json
{"payload": "B0000000000000003110845134F864EA1823BACB2CF410E1E6EF6CD53F6142CC8B7400CCD8F5C763EA5D4275D512CD77B53B479B6BD7708FCE6464D5A70A9E02D5BCB1CF3583470B1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98000000000198544140420F000000000060514D9610000000988E1191A25A88142C2FB3F69787576E3DC713EFC1CE4DE90000010000000000CE8BA0672E21C07240420F0000000000"}
$ cat transactionHash.txt
98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE
```

署名済みのトランザクションデータが得られた。


## ネットワークへトランザクションの送信

> Finally, send the payload to the desired network using the specified node endpoint:
> Symbol: PUT /transactions

これをエンドポイントの`/transactions`へPUTする。

- [sym\-test\-01\.opening\-line\.jp:3001](https://sym-test-01.opening-line.jp:3001/)

送信先ノードはこちらを使わせてもらう。

```shell
$ curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions
{"message":"packet 9 was pushed to the network via /transactions"}
```

トランザクションの受認可否結果は非同期に行われるため、このレスポンスからは判断できない。
レスポンスのメッセージはあくまでも、トランザクションを受け付けたということだけ。


## トランザクションの状態を確認

エンドポイントの`/transactionStatus/{TransactionHash}`へ問い合わせて、トランザクションの状態を確認する。

```shell
$ curl "https://sym-test-01.opening-line.jp:3001/transactionStatus/$(cat transactionHash.txt)"
{"group":"unconfirmed","code":"Success","hash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","deadline":"71243353244","height":"0"}
```

トランザクションが承認されると承認後のエンドポイントの`/transactions/confirmed/{TransactionHash}`を見るか、エクスプローラでも確認できるようになる。

```shell
$ curl "https://sym-test-01.opening-line.jp:3001/transactions/confirmed/$(cat transactionHash.txt)"
{"meta":{"height":"2100850","hash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","merkleComponentHash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","index":0,"timestamp":"71233950045","feeMultiplier":5681},"transaction":{"size":176,"signature":"3110845134F864EA1823BACB2CF410E1E6EF6CD53F6142CC8B7400CCD8F5C763EA5D4275D512CD77B53B479B6BD7708FCE6464D5A70A9E02D5BCB1CF3583470B","signerPublicKey":"1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98","version":1,"network":152,"type":16724,"maxFee":"1000000","deadline":"71241126240","recipientAddress":"988E1191A25A88142C2FB3F69787576E3DC713EFC1CE4DE9","mosaics":[{"id":"72C0212E67A08BCE","amount":"1000000"}]},"id":"679F2AC16583EA846923CA2E"}%
```

エクスプローラで確認する場合。

- [98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE - Symbol Block Explorer](https://testnet.symbol.fyi/transactions/98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE)

残高から1XEMを送信するトランザクションを実行できた。
