#!/bin/bash

install_git_hooks() {
    PARENT_DIR=$1
    for sourceHookFile in $(ls $PARENT_DIR/git_hooks/*.sh); do 
        targetHookFile=$(echo $sourceHookFile | sed s'/\.sh$//' | sed s'/git_hooks/.git\/hooks/')
        ln -sf "$sourceHookFile" "$targetHookFile"
    done
}
