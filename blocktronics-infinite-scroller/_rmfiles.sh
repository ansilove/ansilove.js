#!/usr/bin/env bash

find packs -type f -not \( -name "*.ans" -o -name "*.ANS" \) -exec rm {} \;
find packs \( -name "*.ans" -o -name "*.ANS" \)
