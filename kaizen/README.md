Tezos changes protocol every few months. By contrast, Tezos testnets have been recreated at each protocol upgrade. Developers have been complaining that the pace of Testnet changes is too fast, and it is tedious to recreate contracts every few months.

**Kaizen** is a new kind of Tezos testnet that upgrades to closely follow Tezos mainnet protocol. We aim to run it for a long time, enough that developers would feel confident publishing contracts into it.

Unlike mainnet, there is no democracy involved: Kaizen upgrades are user-activated. The upgrade blocks are centrally managed on the Teztnets.xyz platform.

Kaizen was previously known as *Granadanet*. Granadanet has been running since May 2021 and has seen significant developer activity. By using Granadanet as a starting point for Kaizen, we benefit from all this prior activity and make developer's lives easier.

Kaizen will hard-fork from Granadanet and upgrade to Hangzhou shortly before mainnet. We encourage all Granadanet bakers to perform the configuration changes described below to participate in the hard fork. Otherwise, you will end up on a different chain where the network never upgraded to If you are running a Granadanet node, here is what you need to do to convert it into a Kaizen node:

1. update Tezos to the most recent release (currently v11.0)
1. update your node's configuration: `tezos-node config update --network https://teztnets.xyz/kaizen`

Your node is now configured to switch protocols to Kaizen at the end of cycle 185 (block 757,759).
