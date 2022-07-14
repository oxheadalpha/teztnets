---
layout: page
title: Kathmandunet
permalink: /kathmandunet-about
---

NOT FINAL Kathmandunet - the real Kathmandunet will start on Monday, July 18th, 2022

| | |
|-------|---------------------|
| Full network name | `TEZOS_KATHMANDUNET_2022-07-07T15:00:00Z` |
| Tezos docker build | [tezos/tezos:master_68127222_20220708153243](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_68127222_20220708153243) |
| Public RPC endpoint | [https://rpc.kathmandunet.teztnets.xyz](https://rpc.kathmandunet.teztnets.xyz) |
| Faucet | [Kathmandunet faucet](https://teztnets.xyz/kathmandunet-faucet) |
| Activated on | 2022-07-07T15:00:00Z |
| Protocol at level 0 |  `PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY` |
| Protocol at level 8192 |  `PtKathmaXYPEsBau83zRwXK19HAQRzZSj6pCXnvtyLZFjRxdQxt` |



Half-baked Kathmandu protocol snapshot, second edition. The real one will come later. PLEASE DO NOT INJECT.

There is no Octez release for this second instance of Kathmandunet. You need to build or grab a build or container from the master branch of Octez built on or after 2022-07-07.

But the protocol is already snapshotted. The baker binary for this protocol is `tezos-baker-014-PtKathma`. Do not run the "alpha" baker, it will not work.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Kathmandunet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_68127222_20220708153243
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 68127222
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


