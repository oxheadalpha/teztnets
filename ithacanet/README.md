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
