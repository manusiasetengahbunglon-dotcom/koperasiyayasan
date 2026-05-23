import { useEffect, useState } from 'react'
import {
  ArrowUpCircle,
  Plus,
  CalendarDays,
  Receipt,
  Wallet,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function KasKeluar() {
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
      .eq('jenis', 'keluar')
      .order('id', { ascending: false })

    if (!error) setTransaksi(data || [])
  }

  async function tambahTransaksi(e) {
    e.preventDefault()

    if (!form.keterangan || !form.kategori || !form.nominal || !form.tanggal) {
      alert('Lengkapi data terlebih dahulu')
      return
    }

    const { error } = await supabase.from('transaksi').insert([
      {
        jenis: 'keluar',
        keterangan: form.keterangan,
        kategori: form.kategori,
        nominal: Number(form.nominal),
        tanggal: form.tanggal,
      },
    ])

    if (error) {
      alert('Gagal menambahkan kas keluar')
      return
    }

    alert('Kas keluar berhasil ditambahkan')

    setForm({
      keterangan: '',
      kategori: '',
      nominal: '',
      tanggal: '',
    })

    getTransaksi()
  }

  const totalKeluar = transaksi.reduce(
    (total, item) => total + Number(item.nominal),
    0
  )

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">
              Transaksi Pengeluaran
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Kas Keluar Yayasan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Catat seluruh pengeluaran dana yayasan.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              Total Kas Keluar
            </p>

            <h2 className="mt-1 text-3xl font-bold text-red-700">
              Rp{totalKeluar.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-700">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Tambah Kas Keluar
              </h2>

              <p className="text-sm text-slate-500">
                Input transaksi pengeluaran
              </p>
            </div>
          </div>

          <form onSubmit={tambahTransaksi} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Keterangan
              </label>

              <input
                type="text"
                placeholder="Contoh: Bayar operasional"
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Kategori
              </label>

              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({ ...form, kategori: e.target.value })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-red-500"
              >
                <option value="">Pilih kategori</option>
                <option value="Operasional">Operasional</option>
                <option value="Konsumsi">Konsumsi</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Pinjaman Anggota">Pinjaman Anggota</option>
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
                  setForm({ ...form, tanggal: e.target.value })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
            >
              <ArrowUpCircle size={18} />
              Simpan Kas Keluar
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Riwayat Kas Keluar
              </h2>

              <p className="text-sm text-slate-500">
                Semua transaksi pengeluaran yayasan
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
                  <tr key={item.id} className="border-t hover:bg-slate-50">
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
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-red-700">
                      Rp{Number(item.nominal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transaksi.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Receipt size={45} />

                <p className="mt-4 font-semibold">
                  Belum ada transaksi kas keluar
                </p>

                <p className="text-sm">
                  Data akan muncul setelah admin input pengeluaran.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}