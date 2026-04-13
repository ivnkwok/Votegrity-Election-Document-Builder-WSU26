from Backend.db_tunnel import start_ssh_tunnel
import os
import sys

server = start_ssh_tunnel()

print("Tunnel ready on port:", server.local_bind_port)

# pass port to environment (optional but clean)
os.environ["DB_PORT"] = str(server.local_bind_port)

# now start Django
os.system("py manage.py runserver")