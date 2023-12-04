#!/bin/env python
import requests
import yaml

def flatten_params(params, parent_key=''):
    flat_params = {}
    for k, v in params.items():
        new_key = f"{parent_key}_{k}" if parent_key else k
        if isinstance(v, dict):
            flat_params.update(flatten_params(v, new_key))
        else:
            flat_params[new_key] = v
    return flat_params

with open("networks/oxfordnet/values.yaml", "r") as f:
    params = flatten_params(yaml.safe_load(f)["activation"]["protocol_parameters"])

mainnet_params = flatten_params(requests.get("https://mainnet.ecadinfra.com/chains/main/blocks/head/context/constants").json())

ghostnet_params = flatten_params(requests.get("https://ghostnet.tezos.marigold.dev/chains/main/blocks/head/context/constants").json())

nairobinet_params = flatten_params(requests.get("https://rpc.nairobinet.teztnets.xyz/chains/main/blocks/head/context/constants").json())

print("Param,oxfordnet,nairobinet,ghostnet,mainnet")
for param in params.keys():
    if not (params[param] == mainnet_params.get(param) == ghostnet_params.get(param) == nairobinet_params.get(param)):
        print(f"{param},{params[param]},{nairobinet_params.get(param, 'not defined')},{ghostnet_params.get(param, 'not defined')},{mainnet_params.get(param, 'not defined')}")
