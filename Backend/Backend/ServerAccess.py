import json
import os

import paramiko


def fetch_remote_elections(limit=10):
    key_path = os.environ.get(
        "HELIOS_SSH_KEY_PATH",
        r"C:\Users\Lance Tieng\Downloads\key.pem"
    )
    hostname = os.environ.get(
        "HELIOS_SSH_HOST", "docscreator-votegrity.westus3.cloudapp.azure.com"
    )
    username = os.environ.get("HELIOS_SSH_USER", "adminuser")
    database = os.environ.get("HELIOS_DB_NAME", "helios")

    if not key_path:
        raise ValueError("HELIOS_SSH_KEY_PATH is not set")

    if not os.path.exists(key_path):
        raise FileNotFoundError(f"SSH key not found: {key_path}")

    key = paramiko.RSAKey.from_private_key_file(key_path)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(hostname=hostname, port=22, username=username, pkey=key)
        command = (
            f"psql {database} -t -A -c "
            f"\"SELECT json_agg(t) FROM "
            f"(SELECT * FROM helios_election LIMIT {int(limit)}) t;\""
        )
        _, stdout, stderr = client.exec_command(command)

        data = stdout.read().decode().strip()
        error_output = stderr.read().decode().strip()

        if error_output:
            raise RuntimeError(error_output)

        return json.loads(data) if data else []
    finally:
        client.close()
v