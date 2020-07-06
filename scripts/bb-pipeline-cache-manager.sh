#!/usr/bin/env bash
# We want to update the cache whenever the package-lock is updated.
PACKAGEPATH=${1?Error: no path to package}
CACHENAME=${2?Error: cache name not given}

if [[ -d ".git" ]]; then
  printf "Detecting Cache...\n"
  if [[ ! -d /opt/atlassian/pipelines/agent/cache/$CACHENAME ]]; then 
    printf "$CACHENAME cache has not been found\n"
    root=$(pwd)
    cd $PACKAGEPATH
    npm install
    cd $root
  elif [[ -z $(git diff HEAD^ HEAD ${PACKAGEPATH}package.json) ]]; then
    printf "Packages has not changed (re-install anyway)\n"
    root=$(pwd)
    cd $PACKAGEPATH
    npm install
    cd $root
  else
    root=$(pwd)
    printf "Packages has changed, clearing cache\n"
    rm -rf /opt/atlassian/pipelines/agent/cache/$CACHENAME
    cd $PACKAGEPATH
    npm install
    cd $root
  fi
fi
