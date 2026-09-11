#!/bin/bash

echo "=================================================="
echo "1. SEMUA EMAIL YANG TERTULIS DI KODE"
echo "=================================================="
grep -rnoE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' --include=\*.{jsx,tsx,ts,js} src/ 2>/dev/null | sort -u

echo ""
echo "=================================================="
echo "2. SEMUA NOMOR TELEPON / WHATSAPP (wa.me, tel:, atau angka panjang)"
echo "=================================================="
grep -rnoE 'wa\.me/[0-9]+' --include=\*.{jsx,tsx,ts,js} src/ 2>/dev/null | sort -u
echo "--"
grep -rnoE 'tel:[0-9+]+' --include=\*.{jsx,tsx,ts,js} src/ 2>/dev/null | sort -u
echo "--"
grep -rnoE '"6[0-9]{9,13}"|"\+62[0-9]{8,13}"' --include=\*.{jsx,tsx,ts,js} src/ 2>/dev/null | sort -u
echo "--"
grep -rniE 'waPhone|whatsapp|phone.*=.*["\x27]6' --include=\*.{jsx,tsx,ts,js} src/ 2>/dev/null | sort -u

echo ""
echo "=== Selesai ==="
