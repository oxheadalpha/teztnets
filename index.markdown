---
layout: home
title: Teztnets
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

florencenet
---------

Long-running test network for the florence protocol.

To join florencenet with docker, run the following commands:

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

galpha2net
---------

Second alpha network for protocol G

To join galpha2net with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_f581581a_20210507100713
~ $ tezos-node config init --network https://teztnets.xyz/galpha2net
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha` |
| Tezos docker build | [tezos/tezos:master_f581581a_20210507100713](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_f581581a_20210507100713) |
| Full network name | `TEZOS_GALPHA2NET_2021-05-07T15:00:00Z` |

mondaynet
---------

A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha

To join mondaynet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_7904a9b2_20210517164345
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha, 009-PsFLoren` |
| Tezos docker build | [tezos/tezos:master_7904a9b2_20210517164345](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_7904a9b2_20210517164345) |
| Full network name | `TEZOS_MONDAYNET_2021-05-19T00:00:00Z` |


Faucet for all teztnets is at [https://faucet.tzalpha.net/](https://faucet.tzalpha.net/)

The list of testnets is also available in [json format](https://teztnets.xyz/teztnets.json).
