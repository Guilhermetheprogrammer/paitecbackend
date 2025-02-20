#!/bin/bash

ts-prune > ts-prune-output.txt

grep -v "(used in module)" ts-prune-output.txt > ts-prune-unused.txt

if [ -s ts-prune-unused.txt ]; then
  echo -e "Path\tSymbol" > ts-prune-table.txt

  awk -F ' - ' '{print $1 "\t" $2}' ts-prune-unused.txt >> ts-prune-table.txt

  column -t -s $'\t' ts-prune-table.txt
else
  echo "No unused symbols found."
fi

rm ts-prune-output.txt ts-prune-unused.txt ts-prune-table.txt
