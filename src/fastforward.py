#!/bin/python
import json
import datetime
import os
import sys
import yaml

if (len(sys.argv) != 3):
    print('Expected exactly 2 parameters (network name, container image spec), found {}'.format(len(sys.argv)))
    exit(1)

network = sys.argv[1]
image = sys.argv[2]

print('Updating initialization parameters for network: {}'.format(network))

try:
    with open(f'{network}/values.yaml', 'r') as in_file:
        network_values = yaml.safe_load(in_file)
except FileNotFoundError:
    print(f'File {network}/values.yaml not found')
    exit(10)

# update network name (based on heretofore observed naming convention)
network_name = f'TEZOS_{network.upper()}_{datetime.datetime.date().isoformat()}T00:00:00Z'
network_values["node_config_network"]["chain_name"] = network_name
# update tezos container image reference
network_values["images"]["tezos"] = image

with open(f'{network}/values.yaml', 'w') as out_file:
    print(yaml.dump(network_values), file=out_file)

print('Updates complete')
