#!/bin/bash

mkdir -p "./dataset"
git clone "https://github.com/LLM4Rocq/miniF2F-rocq/"
cp -r "./miniF2F-rocq/test" "./dataset/"
cp -r "./miniF2F-rocq/valid" "./dataset/"
rm -rf "./miniF2F-rocq"
wget -q "https://raw.githubusercontent.com/LLM4Rocq/nlir/ac1db7e7e54decd34dfbb5f47e607aab2436970e/conf/benchmark/miniF2F.yaml" -O "./dataset/miniF2F.yaml"

for directory in "./dataset/test" "./dataset/valid"; do
  if [ ! -d "$directory" ]; then
    echo "Error: directory '$directory' not found."
    exit 1
  fi

  for file in "$directory"/*; do
    if [ -f "$file" ]; then
      sed -zi 's/\(Proof.\|Proof.\nAdmitted.\)/Proof.\n  admit.\nAdmitted./g' "$file"

      if [ $? -eq 0 ]; then
        echo "File '$file' modified successfully."
      else
        echo "Error: failed to modify file '$file'."
      fi
    fi
  done
done

exit 0