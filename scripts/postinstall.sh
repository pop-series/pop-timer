#!/bin/bash

PRG="$0"
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=`dirname "$PRG"`"/$link"
    fi
done
SAVED="`pwd`"
cd "`dirname \"$PRG\"`/" >/dev/null
SCRIPT_DIR="`pwd -P`"
PROJECT_DIR="$SCRIPT_DIR/.."
cd "$SAVED" >/dev/null

echo "using SCRIPT_DIR: $SCRIPT_DIR"
echo "using PROJECT_DIR: $PROJECT_DIR"

. "$SCRIPT_DIR/utils.sh"

echo "installing git hooks"
install_git_hooks $PROJECT_DIR
