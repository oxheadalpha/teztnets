#!/bin/env python
import requests
import yaml

with open("kathmandunet/values.yaml", "r") as f:
    params = yaml.safe_load(f)["activation"]["protocol_parameters"]

zob = requests.get("https://mainnet.oxheadhosted.com/chains/main/blocks/head/context/constants")

mainnet_params = zob.json()

print("Param,kathmandunet,mainnet")
for param in params.keys():
    if mainnet_params[param] != params[param]:
        print(f"{param},{params[param]},{mainnet_params[param]}")
