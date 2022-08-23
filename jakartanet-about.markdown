---
layout: page
title: Jakartanet
permalink: /jakartanet-about
---

Testnet for the Jakarta protocol proposal, proposed April 2022.

| | |
|-------|---------------------|
| Full network name | `TEZOS_JAKARTANET_2022-04-27T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v13.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v13.0) |
| Public RPC endpoint | [https://rpc.jakartanet.teztnets.xyz](https://rpc.jakartanet.teztnets.xyz) |
| Faucet | [Jakartanet faucet](https://new-faucet.jakartanet.teztnets.xyz) |
| Activated on | 2022-04-27T15:00:00Z |
| Protocol at level 0 |  `Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A` |
| Protocol at level 8192 |  `PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY` |
| Block Explorers | [TzKT](https://jakartanet.tzkt.io) - [TzStats](https://jakarta.tzstats.com) |


Jakartanet ran Ithaca for 2 cycles then switched to Jakarta at block 8192.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v13.0

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Jakartanet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v13.0
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v13.0
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Jakartanet network

Run the following commands:

```
tezos-node config init --network jakartanet

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-jakartanet.log &
> ```


### Bake on the Jakartanet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://new-faucet.jakartanet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-013-PtJakart run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
tezos-accuser-013-PtJakart run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-013-PtJakart run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass > ./baker-jakartanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


