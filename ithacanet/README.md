You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  To bake with a Ledger device, you need the latest version of the app, 2.2.15.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="*baker* -> debug"
```
