To run Jakartanet, you must:

* download and run Octez 13.0-rc1
* pass the argument `--network https://teztnets.xyz/jakartanet` to `tezos-node run`.

**New**: `--network jakartanet` will not work this time. This will be added to the final 13.0 release.

Jakartanet will run Ithaca for 2 cycles then switch to Jakarta at block 8192. **You must run Ithaca baker during the first 2 cycles**.
