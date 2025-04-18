# Create environment

export MINIO_CONTAINER_ID=`docker ps -aqf name=giglabo-file-uploading-minio`
echo $MINIO_CONTAINER_ID

alias minioexec="docker container exec $MINIO_CONTAINER_ID "
alias minioexecit="docker container exec -it $MINIO_CONTAINER_ID "

## Minio setup

    minio-access-key

    minio-secret-key

aws configure --profile minio



Run `minioexecit /bin/bash`

For local

mc alias set local http://<YOUR_IP_HERE>:9000 minioadmin minioadmin

In the terminal:    

    export ACCESSKEY=minio-access-key
    export SECRETKEY=minio-secret-key
    
    mc alias set myminio http://localhost:9000 minioadmin minioadmin
    mc admin info myminio
    

    
    cat > fullaccess-policy.json << EOF
    {
    "Version": "2012-10-17",
    "Statement": [
    {
    "Effect": "Allow",
    "Action": ["s3:*"],
    "Resource": ["arn:aws:s3:::*"]
    }
    ]
    }
EOF
    
    mc admin policy create myminio fullaccess fullaccess-policy.json
    mc admin user add myminio/ newuser newsecretpassword
    mc admin accesskey create        myminio/ newuser               --access-key $ACCESSKEY  --secret-key $SECRETKEY
    
    
    mc admin policy attach myminio fullaccess --user newuser
    mc mb myminio/mybucket


    mc admin config set myminio region name=auto
    mc admin config set myminio site regionauto
    mc admin service restart myminio


## Build and configure nginx


    export CONTAINER_ID=`docker ps -aqf name=dev-nginx`
    docker container exec $CONTAINER_ID nginx -s reload
    docker container exec -it $CONTAINER_ID /bin/sh



## Cloudflare

[
{
"AllowedOrigins": [
"https://file-uploader.giglabo.com/nextjs"
],
"AllowedMethods": [
"GET", "HEAD", "PUT", "POST", "DELETE"
],
"AllowedHeaders": [
"*"
]
}
]

