## Dailynet
A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

To join Dailynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_5958282c_20211102205114
~ $ tezos-node config init --network https://teztnets.xyz/dailynet-2021-11-03
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2021-11-03T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_5958282c_20211102205114](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_5958282c_20211102205114) |
| RPC endpoint | [https://rpc.dailynet-2021-11-03.teztnets.xyz](https://rpc.dailynet-2021-11-03.teztnets.xyz) |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2021-11-03.teztnets.xyz) |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |

