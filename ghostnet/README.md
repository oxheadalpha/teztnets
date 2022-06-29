Ghostnet is centrally managed to follow Tezos Mainnet protocol upgrades. It generally updates to the same protocol than Mainnet a few hours before Mainnet update itself.

Ghostnet was previously known as Ithacanet, the testchain for the Ithaca protocol.

Ghostnet indexers are available at:

* [TzStats](https://ghost.tzstats.com)
* [TzKT](https://ghostnet.tzkt.io)

If you were previously running an Ithacanet node and it is now stuck at upgrade level (765952), you must:

* erase the node storage and restore from a snapshot from [XTZ-Shots](https://xtz-shots.io).
* update your node configuration by running `tezos-node config update --network https://teztnets.xyz/ghostnet`

If your config is not in the default location, you need to add `--config-file <path_to_config_file>` to the above command. To figure out where is the config file currently in use, you may run `ps waux | grep tezos`.
