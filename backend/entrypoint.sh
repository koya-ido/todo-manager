#!/bin/sh
set -eu

until alembic upgrade head; do
  echo "alembic upgrade failed, retrying in 2 seconds..."
  sleep 2
done

exec "$@"
