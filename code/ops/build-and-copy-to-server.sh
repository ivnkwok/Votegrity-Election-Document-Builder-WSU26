#!/usr/bin/env pwsh

npm run build:docscreator
$REL = Get-Date -Format "yyyyMMdd-HHmmss"
tar -czf "docscreator-$REL.tgz" -C dist .

& "C:\Program Files\PuTTY\pscp.exe" .\docscreator-$REL.tgz adminuser@docscreator.votegrity.net:/home/adminuser/helios-server/docscreator/tmp/docscreator-$REL.tgz
