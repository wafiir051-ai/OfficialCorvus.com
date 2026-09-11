#!/bin/bash

echo "=================================================="
echo "1. DAFTAR SEMUA ROUTE YANG BENAR-BENAR ADA (dari file)"
echo "=================================================="
find src/app -type f -name "page.tsx" | sed -E 's|src/app||; s|/page\.tsx||; s|\([^)]*\)||g; s|^$|/|' | sort

echo ""
echo "=================================================="
echo "2. SEMUA LINK/REDIRECT YANG DITULIS DI KODE (href, redirect, router.push)"
echo "=================================================="
grep -rnoE 'href="/[a-zA-Z0-9/_\-\[\]]*"' --include=\*.{jsx,tsx} src/ 2>/dev/null | sort -u -t'"' -k2
echo "--"
grep -rnoE 'redirect\("[^"]*"\)' --include=\*.{jsx,tsx} src/ 2>/dev/null | sort -u
echo "--"
grep -rnoE 'router\.push\("[^"]*"\)' --include=\*.{jsx,tsx} src/ 2>/dev/null | sort -u

echo ""
echo "=================================================="
echo "3. ISI BagPageClient.tsx (halaman keranjang sebenarnya)"
echo "=================================================="
find src -name "BagPageClient.tsx" -exec cat {} \;

echo ""
echo "=================================================="
echo "4. KEMUNGKINAN MASIH PAKAI DATA DUMMY (bukan Supabase)"
echo "=================================================="
grep -rniE "const .*= \[\s*\{|mockData|dummyData|fakeData|sampleData" --include=\*.{jsx,tsx} src/ 2>/dev/null

echo ""
echo "=================================================="
echo "5. TOMBOL/FORM TANPA HANDLER (onClick/onSubmit kosong atau cuma console.log)"
echo "=================================================="
grep -rnE 'onClick=\{?\(\)\s*=>\s*\{?\s*\}?\}?' --include=\*.{jsx,tsx} src/ 2>/dev/null
grep -rn "console.log" --include=\*.{jsx,tsx} src/app 2>/dev/null

echo ""
echo "=== Selesai ==="
