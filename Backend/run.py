from Backend.db_tunnel import start_ssh_tunnel
import os
import subprocess

server = start_ssh_tunnel()

print("Tunnel ready on port:", server.local_bind_port)

os.environ["DB_PORT"] = str(server.local_bind_port)
os.environ["USE_REMOTE_POSTGRES"] = "1"

try:
    subprocess.run(["py", "manage.py", "runserver"], check=True)
finally:
    server.stop()
