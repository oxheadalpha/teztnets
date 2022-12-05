---
layout: page
title: Ghostnet
permalink: /ghostnet-about
---

Ghostnet is the long-running testnet for Tezos.

| | |
|-------|---------------------|
| Public RPC endpoint | [https://rpc.ghostnet.teztnets.xyz](https://rpc.ghostnet.teztnets.xyz) |
| Faucet | [Ghostnet faucet](https://faucet.ghostnet.teztnets.xyz) |
| Full network name | `TEZOS_ITHACANET_2022-01-25T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v15.1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v15.1) |
| Activated on | 2022-01-25T15:00:00Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 8191 |  `Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A` |
| Protocol at level 765952 |  `PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY` |
| Protocol at level 1191936 |  `PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg` |
| Protocol at level 1654784 |  `PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW` |
| Block Explorers | [TzKT](https://ghostnet.tzkt.io) - [TzStats](https://ghost.tzstats.com) |


Ghostnet is centrally managed to follow Tezos Mainnet protocol upgrades. It generally updates to the same protocol than Mainnet one week before Mainnet update itself.

### Ghostnet update to Kathmandu

Ghostnet will update to Lima next Monday, December 12th, at the end of cycle 403.

That's a dress rehersal one week before mainnet. It will provide insight on mainnet migration, and will give us enough time to fix problems (if any).

Every ghostnet baker must immediately:
* upgrade to v15.1 of Octez
* run kathmandu and lima bakers together
* run the following command to update your node config:

```
tezos-node config update --network https://teztnets.xyz/ghostnet
```

To verify that the update was successful, run `tezos-node config show` and observe that your configuration contains the following user-activated upgrade setting:

```
    "user_activated_upgrades": [
      {
        "level": 8191,
        "replacement_protocol": "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"
      },
      {
        "level": 765952,
        "replacement_protocol": "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY"
      },
      {
        "level": 1191936,
        "replacement_protocol": "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg"
      },
      {
        "level": 1654784,
        "replacement_protocol": "PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW"
      }
    ],
```

Note: if your config is not under the default dir (`~/.tezos-node`), you must pass the option `-d /path/to/my/node/dir` to the commands above.

You do not need to be online during activation as long as you performed these steps correctly.

If you don't do step 3, you will be on a fork and will have to rebuild your node storage from scratch. Thanks in advance for your participation.

Generic instructions to start baking on Ghostnet are below.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v15.1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Ghostnet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v15.1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v15.1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Ghostnet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/ghostnet

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-ghostnet.log &
> ```


### Bake on the Ghostnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.ghostnet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-PtLimaPt run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
tezos-accuser-PtLimaPt run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-PtLimaPt run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass > ./baker-ghostnet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


