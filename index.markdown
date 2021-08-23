---
layout: home
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

This list of Teztnets is also available in [json format](https://teztnets.xyz/teztnets.json).

# Long-Running Teztnets


## Florencenet
Long-running test network for the Florence protocol.

To join Florencenet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v9.5
~ $ tezos-node config init --network florencenet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `florencenet` |
| Tezos docker build | [tezos/tezos:v9.5](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v9.5) |
| Faucet | [Florencenet faucet](https://faucet.tzalpha.net) |


## Granadanet
Long-running testnet for Granada proposal.

To join Granadanet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v9.5
~ $ tezos-node config init --network https://teztnets.xyz/granadanet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v9.5](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v9.5) |
| Faucet | [Granadanet faucet](https://faucet.tzalpha.net) |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |



# Periodic Teztnets


## Dailynet
A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

To join Dailynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_86fa76b2_20210820140815
~ $ tezos-node config init --network https://teztnets.xyz/dailynet-2021-08-23
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2021-08-23T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_86fa76b2_20210820140815](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_86fa76b2_20210820140815) |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2021-08-23.teztnets.xyz) |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


## Mondaynet
A testnet that restarts every Monday launched from tezos/tezos master branch and Granadanet protocl, upgrading to alpha at block 255.

To join Mondaynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_86fa76b2_20210820140815
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet-2021-08-23
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2021-08-23T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_86fa76b2_20210820140815](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_86fa76b2_20210820140815) |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2021-08-23.teztnets.xyz) |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 255 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |




