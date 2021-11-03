## Granadanet
Long-running testnet for Granada proposal.

To join Granadanet with docker, run the following commands:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v10.2
~ $ tezos-node config init --network https://teztnets.xyz/granadanet
~ $ tezos-node run
```

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v10.2](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v10.2) |
| RPC endpoint | [https://rpc.granadanet.teztnets.xyz](https://rpc.granadanet.teztnets.xyz) |
| Faucet | [Granadanet faucet](https://faucet.tzalpha.net) |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |

