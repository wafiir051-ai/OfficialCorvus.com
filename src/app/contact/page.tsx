export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-olive">
        Get In Touch
      </p>
      <h1 className="mt-2 font-display text-6xl leading-[0.95] sm:text-7xl">
        Contact
      </h1>
      <p className="mt-8 text-sm text-stone-dark">
        Ada pertanyaan seputar produk, pesanan, atau kerja sama? Tim kami siap
        membantu lewat kanal di bawah ini.
      </p>
      <div className="mt-10 divide-y divide-stone border-t border-ink">
        <div className="py-6">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">Email</p>
          <a href="mailto:corvusofficial.store@gmail.com" className="mt-2 block text-lg underline hover:text-ink">corvusofficial.store@gmail.com</a>
        </div>
        <div className="py-6">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">WhatsApp</p>
          <a href="https://wa.me/6288210678852" target="_blank" rel="noopener noreferrer" className="mt-2 block text-lg underline hover:text-ink">+62 882-1067-8852</a>
        </div>
        <div className="py-6">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">Jam Operasional</p>
          <p className="mt-2 text-lg text-ink-soft">Setiap hari, 24 jam</p>
        </div>
      </div>
    </div>
  );
}
