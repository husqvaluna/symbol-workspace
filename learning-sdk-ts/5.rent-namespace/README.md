# ネームスペース定義の送信

ネームスペースの定義を行う。
ネームスペースはアカウントやモザイクのエイリアスとして使うことができるが、ここでは省略。
後述するアグリゲートトランザクションにて扱う。


## ディスクリプタオブジェクト作成

[rent-namespace.ts](./rent-namespace.ts)


## 手数料の計算

```shell
$ curl -s "https://sym-test-01.opening-line.jp:3001/network/fees/rental" | jq -r
{
  "effectiveRootNamespaceRentalFeePerBlock": "200",
  "effectiveChildNamespaceRentalFee": "10000000",
  "effectiveMosaicRentalFee": "50000000"
}
```
