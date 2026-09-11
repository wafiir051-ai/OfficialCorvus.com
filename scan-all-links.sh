#!/bin/bash

echo "=================================================="
echo "1. DAFTAR ROUTE YANG BENAR-BENAR ADA"
echo "=================================================="
find src/app -type f -name "page.tsx" | sed -E 's|src/app||; s|/page\.tsx||; s|\([^)]*\)||g; s|^$|/|; s|//|/|g' | sort -u

echo ""
echo "=================================================="
echo "2. SEMUA href YANG DITULIS DI SELURUH KODE (semua gaya kutip)"
echo "=================================================="
grep -rnoE 'href=[{]?[`"'"'"'][^`"'"'"']*[`"'"'"']' --include=\*.{jsx,tsx} src/ 2>/dev/null | sort -u -t: -k3

echo ""
echo "=================================================="
echo "3. Link YANG PAKAI VARIABEL DINAMIS (perlu cek manual satu-satu)"
echo "=================================================="
grep -rnE 'href=\{[a-zA-Z]' --include=\*.{jsx,tsx} src/ 2>/dev/null

echo ""
echo "=== Selesai ==="
