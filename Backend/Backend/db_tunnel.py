from sshtunnel import SSHTunnelForwarder

def start_ssh_tunnel():
    print("Called")
    try:
        server = SSHTunnelForwarder(
            ('docscreator-votegrity.westus3.cloudapp.azure.com', 22),
            ssh_username='adminuser',
            ssh_pkey=r"C:\Users\Lance Tieng\Documents\GitHub\WSU-Capstone-2025\Backend\Backend\key.pem",
            remote_bind_address=('127.0.0.1', 5432),
            local_bind_address=('127.0.0.1', 0)
        )

        server.start()

        print("Tunnel started on port:", server.local_bind_address)

        return server

    except Exception as e:
        print("Tunnel failed:", e)