---
layout: page
title: Dailynet
permalink: /dailynet-about
---

A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2022-09-30T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_d631cd0f_20220929210436](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_d631cd0f_20220929210436) |
| Public RPC endpoint | [https://rpc.dailynet-2022-09-30.teztnets.xyz](https://rpc.dailynet-2022-09-30.teztnets.xyz) |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2022-09-30.teztnets.xyz) |
| Activated on | 2022-09-30T00:00:00.000Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Dailynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_d631cd0f_20220929210436
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout d631cd0f
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Dailynet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/dailynet-2022-09-30

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-dailynet-2022-09-30.log &
> ```


