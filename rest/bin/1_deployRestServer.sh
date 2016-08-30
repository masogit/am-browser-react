#!/bin/bash
SCRIPTPATH=`dirname "$0"`
if [ ! -f "$SCRIPTPATH/../websvc/package.properties" ]; then
  echo ####### ERROR: CUSTOM CONFIG #########
  echo Please check your self-defined package.properties exist!
  echo ##########################################################
else
  "$SCRIPTPATH/../deploy/deploy.sh" -x64 ../websvc/package.properties
fi
echo ""