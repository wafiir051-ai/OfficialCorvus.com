#!/bin/bash

echo "=== admin/layout.tsx (definisi item.href untuk menu admin) ==="
cat "src/app/admin/layout.tsx"

echo ""
echo "=== HeaderClient.tsx (definisi link.href dan affiliateHref) ==="
cat "src/components/layout/HeaderClient.tsx"

echo ""
echo "=== AdminMobileNav.tsx (definisi item.href) ==="
cat "src/components/admin/AdminMobileNav.tsx"

echo ""
echo "=== potongan sekitar waLink di admin/affiliates/[id]/page.tsx ==="
grep -n "waLink" -B5 -A5 "src/app/admin/affiliates/[id]/page.tsx"

echo "=== Selesai ==="
