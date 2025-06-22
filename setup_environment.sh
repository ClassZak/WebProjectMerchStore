#!/bin/bash

sudo apt-get install mysql-server


python3 -m venv .venv
. .venv/bin/activate


pip install Flask mysql-connector-python