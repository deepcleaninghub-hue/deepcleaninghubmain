#!/bin/bash

# Script to resolve merge conflicts by taking the newer version (after =======)

echo "Resolving merge conflicts in shared/src directory..."

# Find all TypeScript files with merge conflicts
find shared/src -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "<<<<<<< HEAD" "$file"; then
        echo "Processing: $file"
        
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Process the file to resolve conflicts
        awk '
        /^<<<<<<< HEAD/ {
            # Skip until we find =======
            while (getline && $0 !~ /^=======/) {
                # Skip lines in HEAD section
            }
            # Skip the ======= line
            next
        }
        /^>>>>>>> refs\/remotes\/origin\/main/ {
            # Skip the closing marker
            next
        }
        {
            # Print all other lines (including the newer version)
            print
        }
        ' "$file" > "$temp_file"
        
        # Replace the original file
        mv "$temp_file" "$file"
        
        echo "Resolved conflicts in: $file"
    fi
done

echo "All merge conflicts resolved!"
