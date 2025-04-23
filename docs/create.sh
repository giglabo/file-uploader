#!/usr/bin/env bash
mkdir -p logs
python3 -m venv ./venv

./venv/bin/python3 -m pip install --upgrade pip
./venv/bin/pip3 install -r requirements.txt


