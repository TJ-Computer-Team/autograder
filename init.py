#!/usr/bin/env python3

import os; import sys; import requests; import logging

type = logging.INFO
logging.basicConfig(level=type, format='%(message)s')

def get_env(var, required=True):
    value = os.getenv(var)
    if required and not value:
        logging.error(f"Environment variable '{var}' is required.")
        sys.exit(1)
    return value

def get_external_ip():
    url = 'http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip'
    resp = requests.get(url, headers={'Metadata-Flavor': 'Google'})
    resp.raise_for_status()
    ip = resp.text.strip()
    logging.info(f"Current external IP: {ip}")
    return ip

def get_zone_id(domain, headers):
    url = 'https://api.cloudflare.com/client/v4/zones'
    params = {'name': domain}
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    result = resp.json()
    if not result.get('success') or not result['result']:
        logging.error(f"Could not find Zone ID for domain '{domain}'")
        sys.exit(1)
    zone_id = result['result'][0]['id']
    logging.info(f"Zone ID for {domain}: {zone_id}")
    return zone_id

def get_record(zone_id, full_name, headers):
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records'
    params = {'type': 'A', 'name': full_name}
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    data = resp.json()
    if data.get('result'):
        record = data['result'][0]
        return record['id'], record['content']
    return None, None

def update_record(zone_id, record_id, full_name, ip, headers):
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}'
    payload = { 'type': 'A', 'name': full_name, 'content': ip, 'ttl': 1, 'proxied': False }
    resp = requests.put(url, headers=headers, json=payload)
    resp.raise_for_status()
    result = resp.json()
    if result.get('success'):
        logging.info(f"Updated {full_name} to {ip}")
    else:
        logging.error(f"Failed to update {full_name}: {result.get('errors')}")


def main():
    domain = 'tjctgrader.org'
    record_names = ['@', 'www']

    token = get_env('CF_API_TOKEN')
    headers = { 'Authorization': f'Bearer {token}', 'Content-Type': 'application/json' }


    ip = get_external_ip()
    zone_id = get_zone_id(domain, headers)

    for name in record_names:
        full_name = domain if name == '@' else f"{name}.{domain}"
        record_id, old_ip = get_record(zone_id, full_name, headers)
        if not record_id:
            logging.warning(f"No A record found for {full_name}, skipping.")
            continue
        logging.info(f"{full_name} currently points to {old_ip}")
        if old_ip == ip:
            logging.info(f"No update needed for {full_name}")
        else:
            update_record(zone_id, record_id, full_name, ip, headers)

if __name__ == '__main__': main()
