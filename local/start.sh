#!/bin/bash

export curDir=$(pwd)

if [ -z "$IP_ADDR" ]
then
if [ -z "$MASK" ]
then
    export IP_ADDR=`ifconfig -a|awk '{print $1 " " $2}'|egrep -w 'Link|inet'|sed 's/ Link//'|sed 's/ addr://' | tail -1 |  tr " " "\n" | tail -1`
else
    export IP_ADDR=`ifconfig -a|awk '{print $1 " " $2}'|egrep -w 'Link|inet'|sed 's/ Link//'|sed 's/ addr://' | grep $MASK |  tr " " "\n" | tail -1`
fi
fi

if [ -z "$IP_ADDR_PUBLIC" ]
then
export IP_ADDR_PUBLIC=$IP_ADDR
fi
echo $IP_ADDR


docker compose  --project-name giglabo-file-uploading-dev -f docker-compose.yml up --build
