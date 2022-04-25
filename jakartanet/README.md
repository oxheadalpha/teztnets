You can run Jakartanet by passing the argument `--network jakartanet` to `tezos-node run`.

Jakartanet will run Ithaca for 2 cycles then switch to Jakarta at block 8192.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="*baker* -> debug"
```
