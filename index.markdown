---
layout: home
title: Teztnets
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

mondaynet
---------

A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha

To join mondaynet, download tezos-node from the specified docker build then run:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_51885e67_20210430152819
~ $ tezos-node config init --network https://teztnets.xyz/mondaynet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha` |
| Tezos docker build | [tezos/tezos:master_51885e67_20210430152819](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_51885e67_20210430152819) |
| Full network name | `TEZOS_MONDAYNET_2021-05-03T00:00:00Z` |

galphanet
---------

First alpha network for protocol G

To join galphanet, download tezos-node from the specified docker build then run:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_0a7fe025_20210428084834
~ $ tezos-node config init --network https://teztnets.xyz/galphanet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha` |
| Tezos docker build | [tezos/tezos:master_0a7fe025_20210428084834](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_0a7fe025_20210428084834) |
| Full network name | `TEZOS_GALPHANET_2021-04-28T15:00:00Z` |


Faucet for all teztnets is at [https://faucet.tzalpha.net/](https://faucet.tzalpha.net/)

The list of testnets is also available in [json format](https://teztnets.xyz/teztnets.json).
