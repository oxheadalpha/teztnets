---
layout: home
title: Teztnets
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

dailynet
---------

A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

To join dailynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_88f0423f_20210706211134
~ $ tezos-node config init --network https://teztnets.xyz/dailynet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha, 009-PsFLoren` |
| Tezos docker build | [tezos/tezos:master_88f0423f_20210706211134](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_88f0423f_20210706211134) |
| Full network name | `TEZOS-DAILYNET-2021-07-07T00:00:00.000Z` |

florencenoba
---------

Long-running test network for the florence protocol.

To join florencenoba with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v9.1
~ $ tezos-node config init --network florencenet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-009-PsFLoren` |
| Tezos docker build | [tezos/tezos:v9.1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v9.1) |
| Full network name | `florencenet` |

granadanet
---------

Long-running testnet for Granada proposal.

To join granadanet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v9.2
~ $ tezos-node config init --network https://teztnets.xyz/granadanet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-009-PsFLoren, 010-PtGRANAD` |
| Tezos docker build | [tezos/tezos:v9.2](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v9.2) |
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |

mondaynet
---------

A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha.

To join mondaynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_83520f2b_20210702233102
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha, 009-PsFLoren` |
| Tezos docker build | [tezos/tezos:master_83520f2b_20210702233102](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_83520f2b_20210702233102) |
| Full network name | `TEZOS-MONDAYNET-2021-07-05T00:00:00.000Z` |


Faucet for all teztnets is at [https://faucet.tzalpha.net/](https://faucet.tzalpha.net/)

The list of testnets is also available in [json format](https://teztnets.xyz/teztnets.json).
