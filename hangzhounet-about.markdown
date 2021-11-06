---
layout: page
title: Hangzhounet
permalink: /hangzhounet-about
---

Long-running testnet for Hangzhou proposal.

| | |
|-------|---------------------|
| Full network name | `TEZOS_HANGZHOUNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0-rc2](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0-rc2) |
| Public RPC endpoint | [https://rpc.hangzhounet.teztnets.xyz](https://rpc.hangzhounet.teztnets.xyz) |
| Faucet | [Hangzhounet faucet](https://teztnets.xyz/hangzhounet-faucet) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 8191 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |




### Install the software

#### Using docker

To join Hangzhounet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0-rc2
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b v11.0-rc2
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Hangzhounet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/hangzhounet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-hangzhounet.log &
> ```


### Bake on the Hangzhounet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/hangzhounet-faucet).

Register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet > ./baker-hangzhounet.log &
> ```

Note that you need a minimum amount of tez to get baking rights, and it will take you several cycles to start baking.


