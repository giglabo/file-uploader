#!/bin/bash

source ./venv/bin/activate
pip install -e .

cd giglabo-file-uploader-docs
mkdocs build


