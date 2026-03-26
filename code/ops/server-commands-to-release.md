# Get into the server via Putty and perform these commands to create a new release.

## 1) Set app path and release id (must match local $REL used in the uploaded filename)

    APP=/home/adminuser/helios-server/docscreator

    REL={your release id here (same as $REL when doing the build and copying to server locally)}

## 2) Create release folder

    mkdir -p "$APP/releases/$REL"

## 3) Extract uploaded archive into that release folder

    tar -xzf "$APP/tmp/docscreator-$REL.tgz" -C "$APP/releases/$REL"

## 4) Switch current to this new release

    ln -sfn "$APP/releases/$REL" "$APP/current"

## 5) Verify

    ls -l "$APP/current"

## 6) Restart Apache

    sudo systemctl reload apache2