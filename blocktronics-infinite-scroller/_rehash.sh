#!/usr/bin/env bash

pushd blocktronics-infinite-scroller
find packs -type f -not \( -name "*.ans" -o -name "*.ANS" \) -exec rm {} \;
find packs \( -name "*.ans" -o -name "*.ANS" \) > file_list.txt
popd
echo "Done."