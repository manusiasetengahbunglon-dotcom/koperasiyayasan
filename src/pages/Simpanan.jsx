import { useEffect, useState } from 'react'
import {
  Wallet,
  Plus,
  Users,
  CalendarDays,
  PiggyBank,
  HandCoins,
  Scale,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Simpanan() {
  const [anggota, setAnggota] = useState([])
  const [simpanan, setSimpanan] = useState([])
  const [pinjaman, setPinjaman] = useState([])

  const [form, setForm] = useState({
    anggota_id: '',
    nominal: '',
    tanggal: '',
    keterangan: '',
  })

  useEffect(() => {
    getAnggota()
    getSimpanan()
    getPinjaman()
  }, [])

  async function getAnggota() {
    const { data } = await supabase
  .from('pinjaman')
  .select('*')
  .order('tanggal', { ascending: false })

    setAnggota(data || [])
  }

  async function getSimpanan() {
    const { data } = await supabase
      .from('simpanan')
      .select(`
        *,
        anggota (
          nama
        )
      `)
      .order('id', { ascending: false })

    setSimpanan(data || [])
  }

  async function getPinjaman() {
    const { data } = await supabase
      .from('pinjaman')
      .select('*')

    setPinjaman(data || [])
  }

  async function tambahSimpanan(e) {
    e.preventDefault()

    if (!form.anggota_id || !form.nominal || !form.tanggal) {
      alert('Lengkapi data terlebih dahulu')
      return
    }

    const nominal = Number(form.nominal)

    const { error } = await supabase
      .from('simpanan')
      .insert([
        {
          anggota_id: form.anggota_id,
          jenis: 'wajib',
          setor: nominal,
          tarik: 0,
          saldo: nominal,
          tanggal: form.tanggal,
        },
      ])

    if (error) {
      console.log(error)
      alert('Gagal menambahkan simpanan')
      return
    }

    await supabase.from('transaksi').insert([
      {
        jenis: 'masuk',
        kategori: 'Simpanan',
        nominal: nominal,
        tanggal: form.tanggal,
        keterangan: form.keterangan || 'Simpanan anggota',
      },
    ])

    alert('Simpanan berhasil ditambahkan')

    setForm({
      anggota_id: '',
      nominal: '',
      tanggal: '',
      keterangan: '',
    })

    getSimpanan()
  }

  function formatRupiah(angka) {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  function getTotalSimpanan(anggotaId) {
    return simpanan
      .filter((item) => item.anggota_id === anggotaId)
      .reduce(
        (total, item) =>
          total + Number(item.setor || 0) - Number(item.tarik || 0),
        0
      )
  }

  function getSisaPinjaman(anggotaId) {
    return pinjaman
      .filter((item) => item.anggota_id === anggotaId && item.status !== 'lunas')
      .reduce((total, item) => total + Number(item.sisa || 0), 0)
  }

  const totalSimpanan = simpanan.reduce(
    (total, item) =>
      total + Number(item.setor || 0) - Number(item.tarik || 0),
    0
  )

  const totalSisaPinjaman = pinjaman
    .filter((item) => item.status !== 'lunas')
    .reduce((total, item) => total + Number(item.sisa || 0), 0)

  const totalSaldoBersih = totalSimpanan - totalSisaPinjaman

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Simpanan Anggota
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Data Simpanan Yayasan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola simpanan, sisa pinjaman, dan saldo bersih anggota.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HeaderCard
              title="Total Simpanan"
              value={formatRupiah(totalSimpanan)}
              color="blue"
            />

            <HeaderCard
              title="Sisa Pinjaman"
              value={formatRupiah(totalSisaPinjaman)}
              color="orange"
            />

            <HeaderCard
              title="Saldo Bersih"
              value={formatRupiah(totalSaldoBersih)}
              color={totalSaldoBersih < 0 ? 'red' : 'green'}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Tambah Simpanan
              </h2>

              <p className="text-sm text-slate-500">
                Input simpanan anggota
              </p>
            </div>
          </div>

          <form onSubmit={tambahSimpanan} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Pilih Anggota
              </label>

              <select
                value={form.anggota_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    anggota_id: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">Pilih anggota</option>

                {anggota.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nominal Simpanan
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
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Keterangan
              </label>

              <textarea
                placeholder="Opsional"
                value={form.keterangan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    keterangan: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <Wallet size={18} />
              Simpan Data
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Riwayat Simpanan
              </h2>

              <p className="text-sm text-slate-500">
                Semua data simpanan anggota
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {simpanan.length} data
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4 text-left">Tanggal</th>
                  <th className="p-4 text-left">Anggota</th>
                  <th className="p-4 text-left">Jenis</th>
                  <th className="p-4 text-left">Setor</th>
                  <th className="p-4 text-left">Tarik</th>
                </tr>
              </thead>

              <tbody>
                {simpanan.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {item.tanggal}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {item.anggota?.nama}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.jenis || 'wajib'}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-blue-700">
                      {formatRupiah(item.setor)}
                    </td>

                    <td className="p-4 font-bold text-red-600">
                      {formatRupiah(item.tarik)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {simpanan.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <PiggyBank size={45} />

                <p className="mt-4 font-semibold">
                  Belum ada data simpanan
                </p>

                <p className="text-sm">
                  Data akan muncul setelah admin input simpanan.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
            <Users size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              Saldo Bersih Per Anggota
            </h2>

            <p className="text-sm text-slate-500">
              Total simpanan dikurangi sisa pinjaman anggota.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {anggota.map((item) => {
            const totalSimpananAnggota = getTotalSimpanan(item.id)
            const sisaPinjamanAnggota = getSisaPinjaman(item.id)
            const saldoBersih =
              totalSimpananAnggota - sisaPinjamanAnggota

            return (
              <div key={item.id} className="rounded-2xl border bg-slate-50 p-4">
                <h3 className="font-bold text-slate-800">
                  {item.nama}
                </h3>

                <div className="mt-4 space-y-3">
                  <SmallInfo
                    icon={<Wallet size={16} />}
                    label="Total Simpanan"
                    value={formatRupiah(totalSimpananAnggota)}
                    color="blue"
                  />

                  <SmallInfo
                    icon={<HandCoins size={16} />}
                    label="Sisa Pinjaman"
                    value={formatRupiah(sisaPinjamanAnggota)}
                    color="orange"
                  />

                  <SmallInfo
                    icon={<Scale size={16} />}
                    label="Saldo Bersih"
                    value={formatRupiah(saldoBersih)}
                    color={saldoBersih < 0 ? 'red' : 'green'}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function HeaderCard({ title, value, color }) {
  const styles = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    red: 'border-red-100 bg-red-50 text-red-700',
  }

  return (
    <div className={`rounded-2xl border px-5 py-4 ${styles[color]}`}>
      <p className="text-xs font-bold uppercase">{title}</p>
      <h2 className="mt-1 text-xl font-bold">{value}</h2>
    </div>
  )
}

function SmallInfo({ icon, label, value, color }) {
  const styles = {
    blue: 'text-blue-700',
    orange: 'text-orange-700',
    green: 'text-emerald-700',
    red: 'text-red-700',
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <strong className={styles[color]}>
        {value}
      </strong>
    </div>
  )
}