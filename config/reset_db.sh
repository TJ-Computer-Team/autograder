#!/bin/bash

set -e

docker compose down -v --remove-orphans

echo "Removing Postgres image..."
docker rmi postgres:16 || true

echo "Rebuilding..."
docker compose build

echo "Done."
