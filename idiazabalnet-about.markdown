---
layout: page
title: Idiazabalnet DRY RUN
permalink: /idiazabalnet-about
---

Dry-run for Idiazabalnet. Do not use! The real one starts on 11/09

| | |
|-------|---------------------|
| Full network name | `TEZOS_IDIAZABALNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:master_a8e1dd3c_20211104172223](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_a8e1dd3c_20211104172223) |
| Public RPC endpoint | [https://rpc.idiazabalnet.teztnets.xyz](https://rpc.idiazabalnet.teztnets.xyz) |
| Faucet | [Idiazabalnet DRY RUN faucet](https://teztnets.xyz/idiazabalnet-faucet) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |




### Install the software

#### Using docker

To join Idiazabalnet DRY RUN with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_a8e1dd3c_20211104172223
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b a8e1dd3c
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Idiazabalnet DRY RUN network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/idiazabalnet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>[color=purple]
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-idiazabalnet.log &
> ```


### Bake on the Idiazabalnet DRY RUN network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/idiazabalnet-faucet).

Register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-alpha run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
> [color=purple]
> ```bash=4
> nohup tezos-baker-alpha run with local node ~/.tezos-node faucet > ./baker-idiazabalnet.log &
> ```

Note that you need a minimum amount of tez to get rights.


