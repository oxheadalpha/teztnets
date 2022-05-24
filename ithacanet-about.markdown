---
layout: page
title: Ithacanet
permalink: /ithacanet-about
---

Testnet for the Ithaca2 protocol proposal, proposed January 2022

| | |
|-------|---------------------|
| Full network name | `TEZOS_ITHACANET_2022-01-25T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v13.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v13.0) |
| Public RPC endpoint | [https://rpc.ithacanet.teztnets.xyz](https://rpc.ithacanet.teztnets.xyz) |
| Faucet | [Ithacanet faucet](https://teztnets.xyz/ithacanet-faucet) |
| Activated on | 2022-01-25T15:00:00Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 8191 |  `Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A` |


You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  To bake with a Ledger device, you need the latest version of the app, 2.2.15.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="*baker* -> debug"
```


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v13.0

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Ithacanet with docker, open a shell in the container:

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

### Join the Ithacanet network

Run the following commands:

```
tezos-node config init --network ithacanet

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-ithacanet.log &
> ```


### Bake on the Ithacanet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/ithacanet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-012-Psithaca run with local node ~/.tezos-node faucet
```

You may run the accuser as well:
```bash=3
tezos-accuser-012-Psithaca run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-012-Psithaca run with local node ~/.tezos-node faucet > ./baker-ithacanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


