---
layout: page
title: Ghostnet
permalink: /ghostnet-about
---

Ghostnet is the long-running testnet for Tezos

| | |
|-------|---------------------|
| Full network name | `TEZOS_ITHACANET_2022-01-25T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v13.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v13.0) |
| Public RPC endpoint | [https://rpc.ithacanet.teztnets.xyz](https://rpc.ithacanet.teztnets.xyz) |
| Faucet | [Ghostnet faucet](https://teztnets.xyz/ithacanet-faucet) |
| Activated on | 2022-01-25T15:00:00Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 8191 |  `Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A` |
| Protocol at level 765952 |  `PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY` |


Ithacanet is turning into a long running testnet callled ghostnet. As a first step, we are going to do an user-activated upgrade of the network to Jakarta on January 28th, on block 765,952.

In order to remain on the network, every baker will have to upgrade to 13.0, turn on their jakarta baker and change their node's configuration.

The tezos json configuration file is typically at `~/.tezos-node/config.json` but may be in a different location.

If you open it, you will find the following line:

```
  "network": "ithacanet"
```

Upgdate your configuration by running `tezos-node config update --network https://teztnets.xyz/ithacanet`

You should now see in your config:

```
  "network": {
    "chain_name": "TEZOS_ITHACANET_2022-01-25T15:00:00Z",
    "genesis": {
      "block": "BLockGenesisGenesisGenesisGenesisGenesis1db77eJNeJ9",
      "protocol": "Ps9mPmXaRzmzk35gbAYNCAw6UXdE2qoABTHbN2oEEc1qM7CwT9P",
      "timestamp": "2022-01-25T15:00:00Z"
    },
    "user_activated_upgrades": [
      {
        "level": 8191,
        "replacement_protocol": "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"
      },
      {
        "level": 765952,
        "replacement_protocol": "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY"
      }
    ],
    "sandboxed_chain_name": "SANDBOXED_TEZOS",
    "default_bootstrap_peers": [],
    "genesis_parameters": {
      "values": {
        "genesis_pubkey": "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC"
      }
    }
  }
```

Alternatively, you can paste this network configuration manually in your config. When done, restart your node.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v13.0

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Ghostnet with docker, open a shell in the container:

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

### Join the Ghostnet network

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


### Bake on the Ghostnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/ithacanet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-013-PtJakart run with local node ~/.tezos-node faucet
```

You may run the accuser as well:
```bash=3
tezos-accuser-013-PtJakart run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-013-PtJakart run with local node ~/.tezos-node faucet > ./baker-ithacanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


