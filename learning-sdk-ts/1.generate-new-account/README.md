# 新規アカウントの生成

まず、検証で使うための新たなアカウントを作成する。
ニーモニックによるアカウントと秘密鍵によるアカウントが存在する。

- [アカウント \- Blockchain Symbol\-SDK v3\.2 \#TypeScript \- Qiita](https://qiita.com/ccHarvestasya/items/d6b87c47aade9d744bbe)

ニーモニックによるアカウントは子孫アカウントを持つことができるが、今回はシンプルな秘密鍵によるアカウントを作成する。

[keypair.ts](./keypair.ts)

```shell
$ bun keypair.ts
Private Key: CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C
Public Key: 1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98
Address: TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI
```

エクスプローラで見れるようにアドレスをメモ。

- [TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI - Symbol Block Explorer](https://testnet.symbol.fyi/accounts/TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI)


# XYMの取得

テスト用のXYMを得るために蛇口に申請する。X(旧Twitter)認証が必要。

- [The XYM Faucet](https://testnet.symbol.tools/)

> Twitter account is unqualified

蛇口からXYMが貰えない…。連携したアカウントが問題なのかな？
別のアカウントで認証したら配布してくれた。
使いこみが浅い、または新規のXアカウントだと駄目なのかも（スパム対策？）

- [578BF0CF369D9079287AE93CA57AEF9C5CB40F13CE833D0D9E63635FDF93B8E3 - Symbol Block Explorer](https://testnet.symbol.fyi/transactions/578BF0CF369D9079287AE93CA57AEF9C5CB40F13CE833D0D9E63635FDF93B8E3)

これでアカウントにXYMをもたせることができた。
