const FAQS = [
  {
    question: "Bagaimana cara memesan?",
    answer:
      "Pilih produk, tambahkan ke bag, lalu lanjutkan checkout. Pesanan akan dikonfirmasi lewat WhatsApp untuk detail pengiriman dan pembayaran.",
  },
  {
    question: "Apakah bisa retur atau tukar ukuran?",
    answer:
      "Ya, kamu bisa mengajukan retur atau penukaran ukuran dalam 7 hari setelah barang diterima, selama produk belum dipakai dan tag masih menempel. Hubungi kami lewat halaman Contact untuk memulai proses ini.",
  },
  {
    question: "Berapa lama pengiriman?",
    answer:
      "Estimasi pengiriman 2-5 hari kerja tergantung lokasi, dikirim menggunakan kurir pilihan (JNE, J&T, atau SiCepat). Nomor resi akan dikirim lewat WhatsApp setelah pesanan diproses.",
  },
  {
    question: "Bagaimana cara memilih ukuran yang tepat?",
    answer:
      "Setiap halaman produk menyertakan panduan ukuran (size chart) yang bisa kamu jadikan acuan sebelum membeli.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Saat ini pembayaran dikonfirmasi langsung lewat WhatsApp setelah checkout, dengan transfer bank sesuai rekening yang diberikan tim kami.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-olive">
        Help Center
      </p>
      <h1 className="mt-2 font-display text-6xl leading-[0.95] sm:text-7xl">
        FAQ
      </h1>

      <div className="mt-10 divide-y divide-stone border-t border-ink">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-6">
            <h2 className="font-display text-lg">{faq.question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
