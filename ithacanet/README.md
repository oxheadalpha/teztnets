Ithacanet will launch on **Wednesday, December 22nd at 15:00 UTC**.

Ithacanet will run Hangzhou for two cycles then perform an upgrade to Ithaca at block 8192.

Ithaca changes are massive, we are looking for as many Tezos bakers as possible to participate in this testnet. Please make yourself known in the Tezos Baking Slack #test-networks channel if you wish to participate as a bootstrap baker.

If you choose to participate as a bootstrap baker, **you must run a node** from genesis. Ithaca is introducing a new consensus mechanism called Tenderbake, where the chain will not produce new blocks if more than one third of the bakers are offline. If you participate, it is your responsibility to keep your node in good working order, so that the chain does not stall.

We are tracking the list of bootstrap bakers at the bottom of [this file](https://github.com/oxheadalpha/teztnets/blob/v6.18/ithacanet/values.yaml). You must provide your public key (starting with `edpk`, NOT the hash starting with `tz`) to get rights at genesis.

You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

### Advanced

Tenderbake consensus algorithm significantly increases the amount of consensus messages. There are 7000 endorsing slots per block. On mainnet, we expect several hundred preendorsements and endorsement messages to be gossiped at every block.

To simulate this behavior, it is important to have many participating bakers in Ithacanet. If you desire, you may run several bakers, in order to generate more consensus messages. If you choose to run several bakers, you must ensure that each one of them is in good working order during the lifecycle of the testnet.

Advanced users may choose to run several bakers.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```
