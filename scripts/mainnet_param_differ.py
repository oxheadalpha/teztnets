#!/bin/env python
import requests
import yaml


def flatten_params(params):
    dal_params = params.pop("dal_parametric")
    for p in dal_params.keys():
        params["dal_" + p]=dal_params[p]
    return params

with open("limanet/values.yaml", "r") as f:
    params = flatten_params(yaml.safe_load(f)["activation"]["protocol_parameters"])

mainnet_params = flatten_params(requests.get("https://mainnet.oxheadhosted.com/chains/main/blocks/head/context/constants").json())


print("Param,limanet,mainnet")
for param in params.keys():
    if mainnet_params.get(param) != params[param]:
        print(f"{param},{params[param]},{mainnet_params.get(param, 'not defined')}")
