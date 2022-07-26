---
layout: page
title: Kathmandunet
permalink: /kathmandunet-about
---

Test Chain for the Kathmandu Protocol Proposal

| | |
|-------|---------------------|
| Full network name | `TEZOS_KATHMANDUNET_2022-07-28T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v14.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v14.0-rc1) |
| Public RPC endpoint | [https://rpc.kathmandunet.teztnets.xyz](https://rpc.kathmandunet.teztnets.xyz) |
| Faucet | [Kathmandunet faucet](https://teztnets.xyz/kathmandunet-faucet) |
| Activated on | 2022-07-28T15:00:00Z |
| Protocol at level 8192 |  `PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg` |



For the first 8192 blocks, Kathmandunet will run the Jakarta protocol. Please start your Jakarta bakers.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v14.0-rc1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Kathmandunet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v14.0-rc1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v14.0-rc1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Kathmandunet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/kathmandunet

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-kathmandunet.log &
> ```


### Bake on the Kathmandunet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/kathmandunet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-014-PtKathma run with local node ~/.tezos-node faucet --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
tezos-accuser-014-PtKathma run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-014-PtKathma run with local node ~/.tezos-node faucet --liquidity-baking-toggle-vote pass > ./baker-kathmandunet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


