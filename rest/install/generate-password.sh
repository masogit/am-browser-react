#!/bin/bash
# ----------------------------------------------------------------------
# Script for generating password files used for encryption/decryption 
# 
# Prequisites: Java JDK 1.6.x or higher
# 
# -----------------------------------------------------------------------

# deployment constants used in this script
declare -r ANT_SCRIPT_NAME="deploy.xml"
declare -r LIB_PREFIX="lib"
declare -r LIB_EXT="so"

# exit status codes
declare -r CANCELLED_EXIT_STATUS=1
declare -r ANT_NOT_FOUND_EXIT_STATUS=1
declare -r JAVA_NOT_FOUND_EXIT_STATUS=1

# dynamically determined script environment constants
declare -r SCRIPT_NAME=`basename "$0"`
declare -r SCRIPT_DIR=`dirname "$0"`
if [ "$SCRIPT_DIR" = "." ]; then
  declare -r AM_DIR=".."
else
  AM_DIR=`dirname "$SCRIPT_DIR"`
fi
declare -r AM_INSTALL_PATH="`cd $AM_DIR; pwd`"
declare -r AM_ANT_LIB_PATH="`cd $SCRIPT_DIR; pwd`/lib"

# decision variables
declare -i WARN_ON_FOREIGN_DIR=1         # by default we warn on unsupported usage
declare -i DEBUG=0

reportJavaNotFound() {
  echo ""
  echo "Java could not be located. A JRE or JDK of version 1.6 or greater needs"
  echo "to be installed and the environment variable JAVA_HOME should be set"
  echo "before running this script."
  echo ""
}

reportAntNotFound() {
  echo ""
  echo "The location of ant could not be determined."
  echo ""
  echo "Version 1.7 or greater of ant must be installed to run this"
  echo "script outside of the installed Asset Manager deploy directory."
  echo "NB: Running this script in this manner is not supported!"
  echo ""
  echo "Please define the ANT_HOME environment variable and set it to"
  echo "the directory in which ant is located (e.g. /opt/ant) or run"
  echo "this script from the Asset Manger deploy directory."
  echo ""
}

checkForAMInstallation() {
  # The libaamapi*.so exists in the bin subdirectory of an installation, so we check that
  # to verify that we are indeed working from the installed copy. Otherwise we warn of
  # possible changes that may be required for the script to operate properly
  if [ ! -f "$AM_INSTALL_PATH"/bin/libaamapi*.so ] && (( $WARN_ON_FOREIGN_DIR )); then
    echo ""
    echo "WARNING! The script you are using is not located in the Asset Manager"
    echo "installation directory. This usage is NOT supported and will likely fail!"
    echo ""
    echo "Ensure also that the deploy.xml file is in the same directory as this"
    echo "script and that you have ant version 1.7 or higher properly installed"
    echo "with the ANT_HOME environment variable set."
    echo ""
    echo "To avoid this message in the future, use the -nowarn flag before any"
    echo "other command line option."
    echo ""
    read -rs -n 1 -p "Press C to continue with this script "
    echo ""
    if [ ! "$REPLY" = "C" ] && [ ! "$REPLY" = "c" ]; then
      echo ""
      exit $CANCELLED_EXIT_STATUS
    fi
    SCRIPT_ADDED_PARAMS="-DAssetManager.InstallPath=${AM_INSTALL_PATH// /\\ }"
    ANT_SCRIPT_FILE="$ANT_SCRIPT_NAME"
  else
    SCRIPT_ADDED_PARAMS="-DPRI.ant.tasks.dir=${AM_ANT_LIB_PATH// /\\ } -Daddl.files.root=${AM_INSTALL_PATH// /\\ } -DAssetManager.InstallPath=${AM_INSTALL_PATH// /\\ }"
    ANT_SCRIPT_FILE="$SCRIPT_DIR/$ANT_SCRIPT_NAME"
  fi
}

checkJavaAndAnt() {
  # if an external ant installation is used, it should be 1.7+. The version 1.6.5
  # provided with the AM installation contains a required regex jar for proper
  # functioning.
  if [ -n "$ANT_HOME" ]; then
    ANT_VER="`$ANT_HOME/bin/ant -version`"
    declare -i ANT_17_SPECIFIED="`expr match \"$ANT_VER\" 'version 1\.[7-9]'`"
  else
    ANT_VER="`ant -version 2>&1`"
    declare -i ANT_17_INSTALLED="`expr match \"$ANT_VER\" 'version 1\.[7-9]'`"
    declare -i ANT_17_SPECIFIED=1
  fi

  # the java version used must be at least version v1.4 to provide the required regular expression capabilities
  if [ -n "$JAVA_HOME" ]; then
    JAVA_VER="`$JAVA_HOME/bin/java -version 2>&1`"
  else
    JAVA_VER="`java -version 2>&1`"
  fi
  declare -i JAVA_INSTALLED="`expr match \"$JAVA_VER\" '1\.[4-7]'`"
}

deploy() {
  SCRIPT_ADDED_PARAMS="-Dtmp=$TMPDIR -DLibrary.Extension=$LIB_EXT -DLibrary.Prefix=$LIB_PREFIX $SCRIPT_ADDED_PARAMS"
  if (( DEBUG )); then
    ANT_PARAMS="-debug"
  else
    ANT_PARAMS="-quiet"
  fi
  CMD_LINE="$1 -emacs --noconfig $ANT_PARAMS -f \"$ANT_SCRIPT_FILE\" $SCRIPT_ADDED_PARAMS $USER_SPECIFIED_PARAMS generate.password.files"
  if (( DEBUG )); then
    echo "Executing the following command:"
    echo "$CMD_LINE"
    echo "with CLASSPATH=$CLASSPATH"
  fi
  if (( DEBUG )); then
    echo ""
  fi
  $CMD_LINE
}

checkForAMInstallation
checkJavaAndAnt

echo ""
if (( JAVA_INSTALLED != 0 )); then
  reportJavaNotFound
  exit $JAVA_NOT_FOUND_EXIT_STATUS
elif [ -f "$SCRIPT_DIR/ant/bin/ant" ]; then
  # RH does not properly see the included regex jar, so we set the classpath explicitly
  export CLASSPATH=$CLASSPATH:$SCRIPT_DIR/ant/lib/jakarta-oro-2.0.8.jar
  deploy "$SCRIPT_DIR/ant/bin/ant" "$ANT_PROPERTIES"
elif (( ANT_17_SPECIFIED == 0 )); then
  deploy "$ANT_HOME/bin/ant" "$ANT_PROPERTIES"
elif (( ANT_17_INSTALLED == 0 )); then
  deploy "ant" "$ANT_PROPERTIES"
else
  reportAntNotFound
  exit $ANT_NOT_FOUND_EXIT_STATUS
fi  
echo ""
