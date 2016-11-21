#!/bin/bash
SCRIPTPATH=`dirname "$0"`
"$SCRIPTPATH/node/bin/node" "$SCRIPTPATH/app/db.js" migrate
echo ""