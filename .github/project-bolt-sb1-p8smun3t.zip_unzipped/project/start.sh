#!/usr/bin/env bash
set -euo pipefail
host="${MONGO_HOST:-mongodb}"
port="${MONGO_PORT:-27017}"

echo "Waiting for MongoDB at ${host}:${port}..."
until nc -z "$host" "$port"; do
  sleep 0.5
done

echo "MongoDB is up - starting uvicorn"
exec uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1
