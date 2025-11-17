#!/bin/bash

# Script to remove duplicate files with " 2" suffix
# These are typically created by macOS Finder or accidental file duplication

echo "🔍 Finding duplicate files with ' 2' suffix..."
echo ""

# Find and list all files with " 2" before the extension
find . -type f \( -name "* 2.tsx" -o -name "* 2.ts" -o -name "* 2.js" -o -name "* 2.jsx" \) | while read -r file; do
    echo "  - $file"
done

echo ""
echo "📊 Total files to delete:"
find . -type f \( -name "* 2.tsx" -o -name "* 2.ts" -o -name "* 2.js" -o -name "* 2.jsx" \) | wc -l

echo ""
read -p "❓ Do you want to delete these files? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    echo ""
    echo "🗑️  Deleting duplicate files..."
    find . -type f \( -name "* 2.tsx" -o -name "* 2.ts" -o -name "* 2.js" -o -name "* 2.jsx" \) -delete
    echo "✅ Cleanup complete!"
else
    echo "❌ Cleanup cancelled."
fi
