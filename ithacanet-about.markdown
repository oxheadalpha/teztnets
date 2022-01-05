---
layout: page
title: Ithacanet
permalink: /ithacanet-about
---

Testnet for the Ithaca protocol proposal

| | |
|-------|---------------------|
| Full network name | `TEZOS_ITHACANET_2021-12-22T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v12.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v12.0-rc1) |
| Public RPC endpoint | [https://rpc.ithacanet.teztnets.xyz](https://rpc.ithacanet.teztnets.xyz) |
| Faucet | [Ithacanet faucet](https://teztnets.xyz/ithacanet-faucet) |
| Activated on | 2021-12-22T15:00:00Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 8191 |  `PsiThaCaT47Zboaw71QWScM8sXeMM7bbQFncK9FLqYc6EKdpjVP` |


You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Ithacanet will run Hangzhou for two cycles then perform an upgrade to Ithaca at block 8192. You must run the **Hangzhou baker and endorser** for the first few days.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not bake with a Ledger device yet. You need to use a hot wallet address. See Ledger [PR 27](https://github.com/LedgerHQ/app-tezos/pull/27) for details.

### Advanced

Tenderbake consensus algorithm significantly increases the amount of consensus messages. There are 7000 endorsing slots per block. On mainnet, we expect several hundred preendorsements and endorsement messages to be gossiped at every block.

To simulate this behavior, it is important to have many participating bakers in Ithacanet. If you desire, you may run several bakers, in order to generate more consensus messages. If you choose to run several bakers, you must ensure that each one of them is in good working order during the lifecycle of the testnet.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v12.0-rc1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Ithacanet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v12.0-rc1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b v12.0-rc1
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
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
tezos-baker-012-PsiThaCa run with local node ~/.tezos-node faucet
```

You may run the accuser as well:
```bash=3
tezos-accuser-012-PsiThaCa run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-012-PsiThaCa run with local node ~/.tezos-node faucet > ./baker-ithacanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


