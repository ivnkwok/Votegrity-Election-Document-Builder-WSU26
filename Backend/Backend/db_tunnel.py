import os

from sshtunnel import SSHTunnelForwarder


def start_ssh_tunnel():
    server = SSHTunnelForwarder(
        (os.getenv("SSH_HOST", "docscreator-votegrity.westus3.cloudapp.azure.com"), int(os.getenv("SSH_PORT", "22"))),
        ssh_username=os.getenv("SSH_USERNAME", "adminuser"),
        ssh_pkey=os.getenv("SSH_PKEY", r"C:\Users\Lance Tieng\Downloads\key.pem"),
        remote_bind_address=(
            os.getenv("POSTGRES_HOST", "127.0.0.1"),
            int(os.getenv("POSTGRES_PORT", "5432")),
        ),
        local_bind_address=("127.0.0.1", 0),
    )

    server.start()
    return server
