---
layout: home
---


mondaynet
---------

A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha

To join mondaynet, download tezos-node from the specified docker build then run:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_a2e6e70c_20210420154916
~ $ tezos-node config init --network https://tqtezos.github.io/teztnets/mondaynet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Baker | `tezos-baker-alpha` |
| Tezos docker build | [tezos/tezos:master_a2e6e70c_20210420154916](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_a2e6e70c_20210420154916) |


Faucet for all teztnets is at [https://faucet.tzalpha.net/](https://faucet.tzalpha.net/)

The list of testnets is also available in [json format](https://teztnets.xyz/teztnets.json).
