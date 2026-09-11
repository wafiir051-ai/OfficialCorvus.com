#!/bin/bash
echo "=== 1. Mencari penanda TODO/FIXME/belum selesai ==="
grep -rniE "todo|fixme|belum|coming soon|work in progress|wip|placeholder|not implemented|belum ada" \
  --include=\*.{js,jsx,ts,tsx} src/ 2>/dev/null

echo ""
echo "=== 2. Mencari komponen/halaman yang isinya kosong atau cuma return null/div kosong ==="
grep -rlnE "return null" --include=\*.{jsx,tsx} src/ 2>/dev/null
grep -rlnE "return \(\s*<div\s*/?>\s*\)" --include=\*.{jsx,tsx} src/ 2>/dev/null

echo ""
echo "=== 3. Mencari file halaman yang sangat pendek (kemungkinan skeleton/belum dikembangkan) ==="
find src -type f \( -name "*.jsx" -o -name "*.tsx" \) -exec sh -c '
  lines=$(wc -l < "$1")
  if [ "$lines" -lt 15 ]; then
    echo "$1 ($lines baris)"
  fi
' _ {} \;

echo ""
echo "=== 4. Mencocokkan route yang didefinisikan ==="
grep -rniE "path=[\"'\''\`]" --include=\*.{jsx,tsx} src/ 2>/dev/null

echo ""
echo "=== Selesai ==="
