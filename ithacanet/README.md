You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Ithacanet will run Hangzhou for two cycles then perform an upgrade to Ithaca at block 8192. You must run the **Hangzhou baker and endorser** for the first few days.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

### Advanced

Tenderbake consensus algorithm significantly increases the amount of consensus messages. There are 7000 endorsing slots per block. On mainnet, we expect several hundred preendorsements and endorsement messages to be gossiped at every block.

To simulate this behavior, it is important to have many participating bakers in Ithacanet. If you desire, you may run several bakers, in order to generate more consensus messages. If you choose to run several bakers, you must ensure that each one of them is in good working order during the lifecycle of the testnet.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```
