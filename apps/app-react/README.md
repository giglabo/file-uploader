mkfile -n 1g ./public/temp.tmp



dd if=/dev/zero of=./public/temp.tmp bs=1 count=0 seek=1g
