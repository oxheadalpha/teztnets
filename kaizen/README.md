Tezos changes protocol every few months. By contrast, Tezos testnets have been recreated at each protocol upgrade. Smart contract developers have been complaining that the pace of Testnet changes is too fast, and it is tedious to recreate contracts every few months.

**Kaizen** is a new kind of experimental Tezos testnet that upgrades to closely follow Tezos mainnet protocol. We aim to run it for a long time.

Unlike mainnet, there is no democracy involved: Kaizen upgrades are user-activated. The upgrade schedule is centrally managed on the Teztnets.xyz platform.

Kaizen was previously known as *Granadanet*. Granadanet has been running since May 2021 and has seen significant developer activity. By using Granadanet as a starting point for Kaizen, we benefit from all this prior activity and make developer's lives easier.

Kaizen hard-forked from Granadanet and upgraded to Hangzhou at cycle 185.

Some bakers have not upgraded and are on an alternative chain that remained on the granada protocol. You can tell which protocol you are running by issuing a RPC request. For example, to query a local node, do:

```
curl http://localhost:8732/chains/main/blocks/head/header | jq -r .protocol
```

If you see PtHangz..., you are on Kaizen. If you see PtGRANAD... you are on an alternative chain that didn't upgrade to Hangzhou.

If you operate a node or baker and are still on granada protocol, you can remediate and join kaizen by:

* upgrading to octez v11
* flushing your node storage (data dir)
* configuring the node to run on kaizen: tezos-node config init --network https://teztnets.xyz/kaizen
* importing a snapshot (optional, not currently available)
* finally tezos-node run

To start a new baker on Kaizen, follow instructions below.
