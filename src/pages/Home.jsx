import { NavLink } from 'react-router-dom'
import {
  ArrowRight,
  GraduationCap,
  HandHelping,
  Music4,
  Store,
} from 'lucide-react'

export default function Home() {
  const layanan = [
    {
      icon: <Store size={34} />,
      title: 'Pelatihan UMKM',
      desc: 'Membantu ABK memahami dunia usaha, produksi, hingga pemasaran agar mampu mandiri secara ekonomi.',
    },
    {
      icon: <HandHelping size={34} />,
      title: 'Pemberdayaan Disabilitas',
      desc: 'Pendampingan dan pembinaan bagi anak berkebutuhan khusus usia 17 tahun ke atas.',
    },
    {
      icon: <Music4 size={34} />,
      title: 'Kelas Musik & Bakat',
      desc: 'Pengembangan minat dan bakat melalui kelas gitar, piano, drum, dan kegiatan kreatif lainnya.',
    },
    {
      icon: <GraduationCap size={34} />,
      title: 'Program Kemandirian',
      desc: 'Membekali anggota dengan keterampilan hidup dan kesiapan memasuki dunia kerja maupun usaha.',
    },
  ]

  const aktivitas = [
    '/aktivitas1.jpeg',
    '/aktivitas2.jpeg',
    '/aktivitas3.jpeg',
    '/aktivitas4.jpeg',
    '/aktivitas5.jpeg',
    '/aktivitas6.jpeg',
  ]

  return (
    <div className="bg-white text-slate-900">
      {/* NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo Yayasan"
              className="h-14 w-14 object-contain"
            />

            <div>
              <h1 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Yayasan Griya Bina Karya
              </h1>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Anak Berkebutuhan Khusus
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm font-bold text-blue-700">
              Beranda
            </a>

            <a
              href="#tentang"
              className="text-sm font-bold text-slate-600 transition hover:text-blue-700"
            >
              Tentang
            </a>

            <a
              href="#layanan"
              className="text-sm font-bold text-slate-600 transition hover:text-blue-700"
            >
              Layanan
            </a>

            <a
              href="#aktivitas"
              className="text-sm font-bold text-slate-600 transition hover:text-blue-700"
            >
              Aktivitas
            </a>

            <a
              href="#kontak"
              className="text-sm font-bold text-slate-600 transition hover:text-blue-700"
            >
              Kontak
            </a>

            <NavLink
              to="/login"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Login
            </NavLink>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <img
          src="/bg-yayasan.jpg"
          alt="Yayasan"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-blue-950/40" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-36 pb-24">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-200">
              ABK UMKM INDONESIA
            </p>

            <h1 className="mt-6 text-5xl font-black leading-tight text-white md:text-7xl">
              Membangun
              <span className="block text-blue-300">
                Kemandirian Disabilitas
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-slate-200 md:text-xl">
              Yayasan Griya Bina Karya Anak Berkebutuhan Khusus merupakan yayasan
              yang berfokus pada pembinaan keterampilan, kewirausahaan, dan
              pengembangan bakat bagi disabilitas atau anak berkebutuhan khusus
              usia 17 tahun ke atas agar mampu mandiri secara ekonomi.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <NavLink
                to="/login"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-blue-700 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-900/30 transition hover:bg-blue-800"
              >
                Masuk ke Sistem

                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </NavLink>

              <a
                href="#tentang"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-900"
              >
                Tentang Yayasan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-700">
              Tentang Yayasan
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Ruang Tumbuh dan Berkarya
              <span className="block text-blue-700">
                Untuk Anak Berkebutuhan Khusus
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-slate-600">
              Yayasan Griya Bina Karya Anak Berkebutuhan Khusus atau dikenal
              sebagai ABK UMKM Indonesia hadir sebagai wadah pembinaan
              keterampilan dan kewirausahaan bagi disabilitas agar memiliki
              kesempatan berkembang, berkarya, dan hidup lebih mandiri.
            </p>

            <p className="text-lg leading-relaxed text-slate-600">
              Dengan konsep one-stop service, yayasan melayani ratusan anggota
              disabilitas dari berbagai daerah di Indonesia melalui program
              pelatihan UMKM, pengembangan bakat, hingga pendampingan ekonomi.
            </p>

            <div className="rounded-3xl bg-blue-700 px-8 py-7">
              <p className="text-2xl font-black italic leading-relaxed text-white">
                “Membina potensi, menciptakan kemandirian, dan membuka masa depan yang lebih baik.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section
        id="layanan"
        className="bg-gradient-to-b from-slate-50 to-white px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-700">
              Layanan Yayasan
            </p>

            <h2 className="mt-5 text-4xl font-black text-slate-900 md:text-5xl">
              Program Pembinaan dan Pengembangan
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {layanan.map((item) => (
              <div
                key={item.title}
                className="group rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  {item.icon}
                </div>

                <h3 className="mt-7 text-2xl font-black text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-4 leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AKTIVITAS */}
      <section id="aktivitas" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-700">
                Aktivitas Yayasan
              </p>

              <h2 className="mt-5 text-4xl font-black text-slate-900 md:text-5xl">
                Kegiatan dan Dokumentasi
              </h2>
            </div>

            <p className="max-w-xl text-lg leading-relaxed text-slate-500">
              Dokumentasi berbagai kegiatan pelatihan, UMKM, pembinaan bakat,
              dan aktivitas pemberdayaan yang dilakukan bersama anggota yayasan.
            </p>
          </div>

          <div className="mt-14 flex gap-6 overflow-x-auto pb-5">
            {aktivitas.map((foto, index) => (
              <div
                key={index}
                className="group relative h-[420px] w-[340px] shrink-0 overflow-hidden rounded-[2rem]"
              >
                <img
                  src={foto}
                  alt={`Aktivitas ${index + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 p-7">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
                    ABK UMKM
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    Aktivitas Yayasan
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section
        id="kontak"
        className="bg-slate-950 px-6 py-28 text-white"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-300">
            Hubungi Kami
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Bersama Membangun Masa Depan yang Lebih Mandiri
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-300">
                Lokasi
              </p>

              <p className="mt-4 leading-relaxed text-slate-300">
                Jalan Jombang Raya No. 1
                <br />
                Tangerang Selatan
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-300">
                WhatsApp
              </p>

              <p className="mt-4 text-lg font-bold text-white">
                0878-8389-3940
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-300">
                Instagram
              </p>

              <p className="mt-4 text-lg font-bold text-white">
                @abk.umkm.indonesia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 px-6 py-8 text-center text-slate-500">
        © 2026 Yayasan Griya Bina Karya Anak Berkebutuhan Khusus
      </footer>
    </div>
  )
}