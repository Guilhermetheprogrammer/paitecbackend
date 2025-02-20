#!/bin/bash

# Define the directories
TARGET_DIRS=("./src" "./test")

# Loop through each target directory
for DIR in "${TARGET_DIRS[@]}"; do
  # Check if the directory exists
  if [ -d "$DIR" ]; then
    # Find and remove all .js files in the target directory and its subdirectories
    find "$DIR" -type f -name "*.js" -exec rm -f {} \;
    echo "All .js files have been removed from $DIR"
  else
    echo "Directory $DIR does not exist."
  fi
done
