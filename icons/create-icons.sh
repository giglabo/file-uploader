#!/usr/bin/env bash

if [ -z "$INPUT_FILE" ]
then
export INPUT_FILE=template.svg
fi

if [ -z "$OUTPUT_FOLDER" ]
then
export OUTPUT_FOLDER=./result
fi

# convert $INPUT_FILE -background none -resize 256x256 -density 64x64 $OUTPUT_FOLDER/favicon.ico
# convert $INPUT_FILE -alpha set -resize 256x256 -density 64x64 $OUTPUT_FOLDER/favicon.ico

mkdir -p $OUTPUT_FOLDER/assets/images/mstile
convert -density 72 -background none -resize 16x16   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-16x16.png
convert -density 72 -background none -resize 32x32   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-32x32.png
convert -density 72 -background none -resize 36x36   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-36x36.png
convert -density 72 -background none -resize 48x48   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-48x48.png
convert -density 72 -background none -resize 64x64   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-64x64.png
convert -density 72 -background none -resize 72x72   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-72x72.png
convert -density 72 -background none -resize 96x96   $INPUT_FILE $OUTPUT_FOLDER/android-chrome-96x96.png

convert -density 72 -background none -resize 144x144 $INPUT_FILE $OUTPUT_FOLDER/android-chrome-144x144.png
convert -density 72 -background none -resize 192x192 $INPUT_FILE $OUTPUT_FOLDER/android-chrome-192x192.png
convert -density 72 -background none -resize 256x256 $INPUT_FILE $OUTPUT_FOLDER/android-chrome-256x256.png
convert -density 72 -background none -resize 180x180 $INPUT_FILE $OUTPUT_FOLDER/apple-touch-icon.png

convert -density 72 -background none -resize 16x16   $INPUT_FILE $OUTPUT_FOLDER/favicon-16x16.png
convert -density 72 -background none -resize 32x32   $INPUT_FILE $OUTPUT_FOLDER/favicon-32x32.png
convert -density 72 -background none -resize 64x64   $INPUT_FILE $OUTPUT_FOLDER/favicon-64x64.png
convert -density 72 -background none -resize 256x256 $INPUT_FILE $OUTPUT_FOLDER/favicon-256x256.png
convert -density 72 -background none -resize 128x128 $INPUT_FILE $OUTPUT_FOLDER/assets/images/favicon-128x128.png
convert -density 144 -background none -resize 192x192 $INPUT_FILE $OUTPUT_FOLDER/assets/images/favicon.192x192@2x.png
convert -density 72 -background none -resize 256x256 $INPUT_FILE $OUTPUT_FOLDER/assets/images/favicon-256x256.png
convert -density 72 -background none -resize 512x512 $INPUT_FILE $OUTPUT_FOLDER/assets/images/favicon-512x512.png
convert -density 72 -background none -resize 1024x1024 $INPUT_FILE $OUTPUT_FOLDER/assets/images/favicon-1024x1024.png

convert -density 72 -background none -resize 150x150 $INPUT_FILE $OUTPUT_FOLDER/assets/images/mstile/mstile-150x150.png
convert -density 72 -background none -resize 144x144 $INPUT_FILE $OUTPUT_FOLDER/assets/images/mstile/mstile-144x144.png
convert -density 72 -background none -resize 310x310 $INPUT_FILE $OUTPUT_FOLDER/assets/images/mstile/mstile-310x310.png


convert $OUTPUT_FOLDER/assets/images/favicon-256x256.png $OUTPUT_FOLDER/favicon.ico
