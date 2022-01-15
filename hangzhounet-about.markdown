---
layout: page
title: Hangzhounet
permalink: /hangzhounet-about
---

Testnet for Hangzhou protocol proposal.

| | |
|-------|---------------------|
| Full network name | `TEZOS_HANGZHOUNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0) |
| Public RPC endpoint | [https://rpc.hangzhounet.teztnets.xyz](https://rpc.hangzhounet.teztnets.xyz) |
| Faucet | [Hangzhounet faucet](https://teztnets.xyz/hangzhounet-faucet) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 8191 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |




### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v11.0

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Hangzhounet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v11.0
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Hangzhounet network

Run the following commands:

```
tezos-node config init --network hangzhounet

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-hangzhounet.log &
> ```


### Bake on the Hangzhounet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/hangzhounet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet
```

You may run the accuser as well:
```bash=3
tezos-accuser-011-PtHangz2 run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet > ./baker-hangzhounet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


