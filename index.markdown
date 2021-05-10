---
layout: home
title: Teztnets
---

Current testnets for the [Tezos](https://tezos.com) blockchain are listed here. [Read more](about/).

galpha2net
---------

Second alpha network for protocol G

To join galpha2net, download tezos-node from the specified docker build then run:

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


Faucet for all teztnets is at [https://faucet.tzalpha.net/](https://faucet.tzalpha.net/)

The list of testnets is also available in [json format](https://teztnets.xyz/teztnets.json).
