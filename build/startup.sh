#!/bin/bash
SCRIPTPATH=`dirname "$0"`
NODE_PATH="`cd $SCRIPTPATH; pwd`/node/bin"
export PATH=$NODE_PATH:$PATH
echo $SCRIPTPATH
if [ ! -d "$SCRIPTPATH/db" ]; then
  mkdir db
  cp -R "$SCRIPTPATH/demo/db" "$SCRIPTPATH"
fi
if [ ! -d "$SCRIPTPATH/ssl" ]; then
  mkdir ssl
  cp -R "$SCRIPTPATH/demo/ssl" "$SCRIPTPATH"
fi
if [ ! -f "$SCRIPTPATH/am-browser-config.properties" ]; then
  echo ####### ERROR: CUSTOM CONFIG #########
  echo Not found custom am-browser-config.properties, please generate it from am-browser-config.properties.default
  echo ##########################################################
else
  node "$SCRIPTPATH/app/server.js"
fi
echo ""