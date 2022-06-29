Half-baked Kathmandu protocol snapshot. The real one will come later. PLEASE DO NOT INJECT.

There is no Octez release for this first instance of Kathmandunet. You need to build or grab a build or container from the master branch of Octez built on or after `Wed Jun 29 17:42:33 2022 +0000` (commit `43d54ff63d`).

But the protocol is already snapshotted. The baker binary for this protocol is `tezos-baker-014-PtKathma`. Do not run the "alpha" baker, it will not work.

Kathmandunet will run Jakarta for the first 2 cycles and then update to Kathmandu, so you also need to run the Jakarta baker at first.

You need to opt-in to be a bootstrap baker, by submitting a PR against [this file in the teztnets repo](https://github.com/oxheadalpha/teztnets/blob/main/kathmandunet/values.yaml) or making yourself known in the baking slack #test-networks channel.
