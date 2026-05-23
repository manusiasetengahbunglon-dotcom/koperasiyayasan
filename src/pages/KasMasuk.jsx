import { useEffect, useState } from 'react'
import {
  ArrowDownCircle,
  Plus,
  CalendarDays,
  Wallet,
  FileText,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function KasMasuk() {
  const [transaksi, setTransaksi] = useState([])

  const [form, setForm] = useState({
    keterangan: '',
    kategori: '',
    nominal: '',
    tanggal: '',
  })

  useEffect(() => {
    getTransaksi()
  }, [])

  async function getTransaksi() {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .eq('jenis', 'masuk')
      .order('id', { ascending: false })

    if (!error) {
      setTransaksi(data || [])
    }
  }

  async function tambahTransaksi(e) {
    e.preventDefault()

    if (
      !form.keterangan ||
      !form.kategori ||
      !form.nominal ||
      !form.tanggal
    ) {
      alert('Lengkapi data terlebih dahulu')
      return
    }

    const { error } = await supabase
      .from('transaksi')
      .insert([
        {
          jenis: 'masuk',
          keterangan: form.keterangan,
          kategori: form.kategori,
          nominal: Number(form.nominal),
          tanggal: form.tanggal,
        },
      ])

    if (error) {
      alert('Gagal menambahkan transaksi')
      return
    }

    alert('Kas masuk berhasil ditambahkan')

    setForm({
      keterangan: '',
      kategori: '',
      nominal: '',
      tanggal: '',
    })

    getTransaksi()
  }

  const totalMasuk = transaksi.reduce(
    (total, item) => total + Number(item.nominal),
    0
  )

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Transaksi Pemasukan
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Kas Masuk Yayasan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Catat seluruh pemasukan dana yayasan.
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <p className="text-sm text-emerald-700 font-medium">
              Total Kas Masuk
            </p>

            <h2 className="mt-1 text-3xl font-bold text-emerald-700">
              Rp{totalMasuk.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-1 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Tambah Kas Masuk
              </h2>

              <p className="text-sm text-slate-500">
                Input transaksi pemasukan
              </p>
            </div>
          </div>

          <form
            onSubmit={tambahTransaksi}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Keterangan
              </label>

              <input
                type="text"
                placeholder="Contoh: Donasi"
                value={form.keterangan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    keterangan: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Kategori
              </label>

              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kategori: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Pilih kategori</option>
                <option value="Donasi">Donasi</option>
                <option value="Simpanan">Simpanan</option>
                <option value="Cicilan">Cicilan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nominal
              </label>

              <input
  type="text"
  placeholder="Rp 0"
  value={
    form.nominal
      ? `Rp ${Number(form.nominal).toLocaleString('id-ID')}`
      : ''
  }
  onChange={(e) => {
    const angka = e.target.value.replace(/\D/g, '')

    setForm({
      ...form,
      nominal: angka,
    })
  }}
  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
/>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tanggal
              </label>

              <input
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tanggal: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <ArrowDownCircle size={18} />
              Simpan Kas Masuk
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Riwayat Kas Masuk
              </h2>

              <p className="text-sm text-slate-500">
                Semua transaksi pemasukan yayasan
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {transaksi.length} transaksi
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4 text-left">Tanggal</th>
                  <th className="p-4 text-left">Keterangan</th>
                  <th className="p-4 text-left">Kategori</th>
                  <th className="p-4 text-left">Nominal</th>
                </tr>
              </thead>

              <tbody>
                {transaksi.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {item.tanggal}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {item.keterangan}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-emerald-700">
                      Rp{Number(item.nominal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transaksi.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Wallet size={45} />

                <p className="mt-4 font-semibold">
                  Belum ada transaksi kas masuk
                </p>

                <p className="text-sm">
                  Data akan muncul setelah admin input transaksi.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}