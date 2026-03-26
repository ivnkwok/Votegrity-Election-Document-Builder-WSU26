# 1) Do a clean install of packages

    npm ci

# 2) Build with the base folder set to docscreator

    npm run build:docscreator

# 3) Get REL variable for release dating

    $REL = Get-Date -Format "yyyyMMdd-HHmmss"

# 4) Compress to a single file with the release dating

    tar -czf "docscreator-$REL.tgz" -C dist .

# 5) Securely copy over to the server

    & "C:\Program Files\PuTTY\pscp.exe" .\docscreator-$REL.tgz adminuser@docscreator.votegrity.net:/home/adminuser/helios-server/docscreator/tmp/docscreator-$REL.tgz
