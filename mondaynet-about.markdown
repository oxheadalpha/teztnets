---
layout: page
title: Mondaynet
permalink: /mondaynet-about
---

A testnet that restarts every Monday launched from tezos/tezos master branch. It runs Lima with SCORU and ZK feature flags on for 8 cycles then upgrades to proto Alpha.

| | |
|-------|---------------------|
| Public RPC endpoint | [https://rpc.mondaynet-2023-01-23.teztnets.xyz](https://rpc.mondaynet-2023-01-23.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2023-01-23.teztnets.xyz) |
| Full network name | `TEZOS-MONDAYNET-2023-01-23T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_067c787b_20230120183948](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_067c787b_20230120183948) |
| Activated on | 2023-01-23T00:00:00.000Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Mondaynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_067c787b_20230120183948
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 067c787b
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Mondaynet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/mondaynet-2023-01-23

octez-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup octez-node run --rpc-addr 127.0.0.1:8732 > ./node-mondaynet-2023-01-23.log &
> ```


