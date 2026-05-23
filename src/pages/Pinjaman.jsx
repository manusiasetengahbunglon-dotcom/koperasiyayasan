import { useEffect, useState } from 'react'
import {
  HandCoins,
  Plus,
  CalendarDays,
  Wallet,
  CreditCard,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Pinjaman() {
  const [anggota, setAnggota] = useState([])
  const [pinjaman, setPinjaman] = useState([])

  const [formPinjaman, setFormPinjaman] = useState({
    anggota_id: '',
    nominal: '',
    tanggal: '',
    keterangan: '',
  })

  const [formCicilan, setFormCicilan] = useState({
    pinjaman_id: '',
    nominal: '',
    tanggal: '',
  })

  useEffect(() => {
    getAnggota()
    getPinjaman()
  }, [])

  async function getAnggota() {
    const { data } = await supabase
      .from('anggota')
      .select('*')
      .order('nama', { ascending: true })

    setAnggota(data || [])
  }

  async function getPinjaman() {
    const { data } = await supabase
      .from('pinjaman')
      .select(`
        *,
        anggota (
          nama
        )
      `)
      .order('id', { ascending: false })

    setPinjaman(data || [])
  }

  async function tambahPinjaman(e) {
    e.preventDefault()

    if (
      !formPinjaman.anggota_id ||
      !formPinjaman.nominal ||
      !formPinjaman.tanggal
    ) {
      alert('Lengkapi data pinjaman')
      return
    }

    const nominal = Number(formPinjaman.nominal)

    const { error } = await supabase
  .from('pinjaman')
  .insert([
    {
      anggota_id: formPinjaman.anggota_id,
      jumlah: nominal,
      jasa: 0,
      sisa: nominal,
      status: 'berjalan',
      tanggal: formPinjaman.tanggal,
    },
  ])

    if (error) {
      alert('Gagal tambah pinjaman')
      return
    }

    await supabase.from('transaksi').insert([
      {
        jenis: 'keluar',
        kategori: 'Pinjaman',
        nominal: nominal,
        tanggal: formPinjaman.tanggal,
        keterangan: 'Pinjaman anggota',
      },
    ])

    alert('Pinjaman berhasil ditambahkan')

    setFormPinjaman({
      anggota_id: '',
      nominal: '',
      tanggal: '',
      keterangan: '',
    })

    getPinjaman()
  }

  async function bayarCicilan(e) {
    e.preventDefault()

    if (
      !formCicilan.pinjaman_id ||
      !formCicilan.nominal ||
      !formCicilan.tanggal
    ) {
      alert('Lengkapi data cicilan')
      return
    }

    const dataPinjaman = pinjaman.find(
      (item) => item.id == formCicilan.pinjaman_id
    )

    const nominalBayar = Number(formCicilan.nominal)
    const sisaBaru =
  Number(dataPinjaman.sisa) - nominalBayar

   await supabase
  .from('pinjaman')
  .update({
    sisa: sisaBaru,
    status: sisaBaru <= 0 ? 'lunas' : 'berjalan',
  })
  .eq('id', formCicilan.pinjaman_id)

    await supabase.from('cicilan').insert([
      {
        pinjaman_id: formCicilan.pinjaman_id,
        nominal: nominalBayar,
        tanggal: formCicilan.tanggal,
      },
    ])

    await supabase.from('transaksi').insert([
      {
        jenis: 'masuk',
        kategori: 'Cicilan',
        nominal: nominalBayar,
        tanggal: formCicilan.tanggal,
        keterangan: 'Pembayaran cicilan anggota',
      },
    ])

    alert('Cicilan berhasil dibayar')

    setFormCicilan({
      pinjaman_id: '',
      nominal: '',
      tanggal: '',
    })

    getPinjaman()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
            <HandCoins size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pinjaman & Cicilan
            </h1>

            <p className="text-sm text-slate-500">
              Kelola pinjaman anggota koperasi yayasan.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Tambah Pinjaman
              </h2>

              <p className="text-sm text-slate-500">
                Input pinjaman anggota
              </p>
            </div>
          </div>

          <form
            onSubmit={tambahPinjaman}
            className="space-y-4"
          >
            <select
              value={formPinjaman.anggota_id}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  anggota_id: e.target.value,
                })
              }
              className="w-full rounded-xl border px-4 py-3 outline-none"
            >
              <option value="">Pilih anggota</option>

              {anggota.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Rp 0"
              value={
                formPinjaman.nominal
                  ? `Rp ${Number(
                      formPinjaman.nominal
                    ).toLocaleString('id-ID')}`
                  : ''
              }
              onChange={(e) => {
                const angka = e.target.value.replace(/\D/g, '')

                setFormPinjaman({
                  ...formPinjaman,
                  nominal: angka,
                })
              }}
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />

            <input
              type="date"
              value={formPinjaman.tanggal}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  tanggal: e.target.value,
                })
              }
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />

            <textarea
              placeholder="Keterangan"
              value={formPinjaman.keterangan}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  keterangan: e.target.value,
                })
              }
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />

            <button className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700">
              Simpan Pinjaman
            </button>
          </form>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Bayar Cicilan
              </h2>

              <p className="text-sm text-slate-500">
                Input pembayaran cicilan anggota
              </p>
            </div>
          </div>

          <form
            onSubmit={bayarCicilan}
            className="space-y-4"
          >
            <select
              value={formCicilan.pinjaman_id}
              onChange={(e) =>
                setFormCicilan({
                  ...formCicilan,
                  pinjaman_id: e.target.value,
                })
              }
              className="w-full rounded-xl border px-4 py-3 outline-none"
            >
              <option value="">Pilih pinjaman</option>

              {pinjaman
                .filter((item) => item.status === 'berjalan')
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.anggota?.nama} - Rp
                    {Number(item.sisa).toLocaleString('id-ID')}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Rp 0"
              value={
                formCicilan.nominal
                  ? `Rp ${Number(
                      formCicilan.nominal
                    ).toLocaleString('id-ID')}`
                  : ''
              }
              onChange={(e) => {
                const angka = e.target.value.replace(/\D/g, '')

                setFormCicilan({
                  ...formCicilan,
                  nominal: angka,
                })
              }}
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />

            <input
              type="date"
              value={formCicilan.tanggal}
              onChange={(e) =>
                setFormCicilan({
                  ...formCicilan,
                  tanggal: e.target.value,
                })
              }
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />

            <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
              Simpan Cicilan
            </button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-bold text-slate-800">
            Data Pinjaman Anggota
          </h2>

          <p className="text-sm text-slate-500">
            Riwayat seluruh pinjaman anggota
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Anggota</th>
                <th className="p-4 text-left">Pinjaman</th>
                <th className="p-4 text-left">Sisa</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {pinjaman.map((item) => (
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
                    {item.anggota?.nama}
                  </td>

                  <td className="p-4 font-bold text-red-600">
                    Rp
                    {Number(item.jumlah).toLocaleString('id-ID')}
                  </td>

                  <td className="p-4 font-bold text-orange-600">
                    Rp
                    {Number(
                      item.sisa
                    ).toLocaleString('id-ID')}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pinjaman.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Wallet size={45} />

              <p className="mt-4 font-semibold">
                Belum ada data pinjaman
              </p>

              <p className="text-sm">
                Data akan muncul setelah admin input pinjaman.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}