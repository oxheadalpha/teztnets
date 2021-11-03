## Mondaynet
A testnet that restarts every Monday launched from tezos/tezos master branch and Granadanet protocol, upgrading to alpha at block 255.

To join Mondaynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_507ff54c_20211029163546
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet-2021-11-01
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2021-11-01T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_507ff54c_20211029163546](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_507ff54c_20211029163546) |
| RPC endpoint | [https://rpc.mondaynet-2021-11-01.teztnets.xyz](https://rpc.mondaynet-2021-11-01.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2021-11-01.teztnets.xyz) |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 255 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |

