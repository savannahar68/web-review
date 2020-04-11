#!/usr/bin/env bash

for d in variants/* ; do
  echo "$d"
  wc -c "$d"/*/main.bundle.min.js | sort -hr
  printf "\n"
done > summary-sizes.txt
