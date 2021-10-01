---
layout: home
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

This list of Teztnets is also available in [json format](https://teztnets.xyz/teztnets.json).

# Periodic Teztnets


## Dailynet
A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

To join Dailynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_b22c73e8_20210930172609
~ $ tezos-node config init --network https://teztnets.xyz/dailynet-2021-10-01
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2021-10-01T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_b22c73e8_20210930172609](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_b22c73e8_20210930172609) |
| RPC endpoint | [https://rpc.dailynet-2021-10-01.teztnets.xyz](https://rpc.dailynet-2021-10-01.teztnets.xyz) |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2021-10-01.teztnets.xyz) |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


## Mondaynet
A testnet that restarts every Monday launched from tezos/tezos master branch and Granadanet protocl, upgrading to alpha at block 255.

To join Mondaynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_541776f8_20210924212143
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet-2021-09-27
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2021-09-27T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_541776f8_20210924212143](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_541776f8_20210924212143) |
| RPC endpoint | [https://rpc.mondaynet-2021-09-27.teztnets.xyz](https://rpc.mondaynet-2021-09-27.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2021-09-27.teztnets.xyz) |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 255 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |



# Long-Running Teztnets


## Granadanet
Long-running testnet for Granada proposal.

To join Granadanet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v10.2
~ $ tezos-node config init --network https://teztnets.xyz/granadanet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v10.2](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v10.2) |
| RPC endpoint | [https://rpc.granadanet.teztnets.xyz](https://rpc.granadanet.teztnets.xyz) |
| Faucet | [Granadanet faucet](https://faucet.tzalpha.net) |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |


## Hangzhounet
Long-running testnet for Hangzhou proposal.

To join Hangzhounet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0-rc1
~ $ tezos-node config init --network https://teztnets.xyz/hangzhounet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS_HANGZHOUNET_2021-09-22T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0-rc1) |
| RPC endpoint | [https://rpc.hangzhounet.teztnets.xyz](https://rpc.hangzhounet.teztnets.xyz) |
| Faucet | [Hangzhounet faucet](https://faucet.hangzhounet.teztnets.xyz) |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 8191 |  `PtHangzHogokSuiMHemCuowEavgYTP8J5qQ9fQS793MHYFpCY3r` |




