## Hangzhounet
Long-running testnet for Hangzhou proposal.

To join Hangzhounet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0-rc1
~ $ tezos-node config init --network https://teztnets.xyz/hangzhounet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS_HANGZHOUNET_2021-09-22T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0-rc1) |
| RPC endpoint | [https://rpc.hangzhounet.teztnets.xyz](https://rpc.hangzhounet.teztnets.xyz) |
| Faucet | [Hangzhounet faucet](https://faucet.hangzhounet.teztnets.xyz) |
| Protocol at level 0 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 8191 |  `PtHangzHogokSuiMHemCuowEavgYTP8J5qQ9fQS793MHYFpCY3r` |

