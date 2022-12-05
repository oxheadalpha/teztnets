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
