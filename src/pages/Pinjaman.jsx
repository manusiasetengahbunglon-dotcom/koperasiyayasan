import { useEffect, useMemo, useState } from 'react'
import {
  HandCoins,
  Plus,
  CalendarDays,
  Wallet,
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Pinjaman() {
  const [anggota, setAnggota] = useState([])
  const [pinjaman, setPinjaman] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const [formPinjaman, setFormPinjaman] = useState({
    anggota_id: '',
    nominal: '',
    tenor: '',
    tanggal: '',
    keterangan: '',
  })

  const [formCicilan, setFormCicilan] = useState({
    pinjaman_id: '',
    nominal: '',
    tanggal: '',
  })

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    setLoading(true)

    const [resAnggota, resPinjaman] = await Promise.all([
  supabase.from('anggota').select('*').order('nama', { ascending: true }),

  supabase
    .from('pinjaman')
    .select('*')
    .order('tanggal', { ascending: false }),
])


    setAnggota(resAnggota.data || [])
    setPinjaman(resPinjaman.data || [])
    setLoading(false)
  }

  function formatRupiah(angka) {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  function angkaOnly(value) {
    return value.replace(/\D/g, '')
  }

  function hitungJatuhTempo(tanggal, tenor) {
    if (!tanggal || !tenor) return ''
    const date = new Date(tanggal)
    date.setMonth(date.getMonth() + Number(tenor))
    return date.toISOString().slice(0, 10)
  }

  const nominalPinjaman = Number(formPinjaman.nominal || 0)
  const tenorPinjaman = Number(formPinjaman.tenor || 0)
  const angsuranPerBulan =
    nominalPinjaman && tenorPinjaman
      ? Math.ceil(nominalPinjaman / tenorPinjaman)
      : 0

  const jatuhTempo = hitungJatuhTempo(
    formPinjaman.tanggal,
    formPinjaman.tenor
  )

  const pinjamanAktif = useMemo(() => {
    return pinjaman.filter(
      (item) =>
        ['aktif', 'berjalan'].includes(String(item.status).toLowerCase()) &&
        Number(item.sisa || 0) > 0
    )
  }, [pinjaman])

  const pinjamanLunas = pinjaman.filter(
    (item) => String(item.status).toLowerCase() === 'lunas'
  )

  const totalPinjamanAktif = pinjamanAktif.reduce(
    (total, item) => total + Number(item.jumlah || 0),
    0
  )

  const totalPiutang = pinjamanAktif.reduce(
    (total, item) => total + Number(item.sisa || 0),
    0
  )
  function getNamaAnggota(id) {
  const data = anggota.find(
    (item) => Number(item.id) === Number(id)
  )

  return data?.nama || '-'
}

const filteredPinjaman = pinjaman.filter((item) =>
  getNamaAnggota(item.anggota_id)
    .toLowerCase()
    .includes(search.toLowerCase())
)


  async function tambahPinjaman(e) {
    e.preventDefault()

    if (
      !formPinjaman.anggota_id ||
      !formPinjaman.nominal ||
      !formPinjaman.tenor ||
      !formPinjaman.tanggal
    ) {
      alert('Lengkapi data pinjaman.')
      return
    }

    const masihAdaPinjaman = pinjamanAktif.some(
      (item) => item.anggota_id == formPinjaman.anggota_id
    )

    if (masihAdaPinjaman) {
      alert('Anggota ini masih memiliki pinjaman aktif.')
      return
    }

    const nominal = Number(formPinjaman.nominal)
    const tenor = Number(formPinjaman.tenor)
    const angsuran = Math.ceil(nominal / tenor)
    const jatuhTempoFinal = hitungJatuhTempo(formPinjaman.tanggal, tenor)

    const { error: errorPinjaman } = await supabase.from('pinjaman').insert([
      {
        anggota_id: formPinjaman.anggota_id,
        jumlah: nominal,
        jasa: 0,
        sisa: nominal,
        tenor,
        angsuran_per_bulan: angsuran,
        jatuh_tempo: jatuhTempoFinal,
        status: 'berjalan',
        tanggal: formPinjaman.tanggal,
      },
    ])

    if (errorPinjaman) {
      console.log(errorPinjaman)
      alert(errorPinjaman.message || 'Gagal tambah pinjaman.')
      return
    }

    const { error: errorTransaksi } = await supabase.from('transaksi').insert([
      {
        jenis: 'keluar',
        kategori: 'Pinjaman',
        nominal,
        tanggal: formPinjaman.tanggal,
        keterangan:
          formPinjaman.keterangan || 'Pencairan pinjaman anggota',
      },
    ])

    if (errorTransaksi) {
      console.log(errorTransaksi)
      alert('Pinjaman tersimpan, tetapi transaksi kas keluar gagal dicatat.')
    }

    alert('Pinjaman berhasil ditambahkan.')

    setFormPinjaman({
      anggota_id: '',
      nominal: '',
      tenor: '',
      tanggal: '',
      keterangan: '',
    })

    getData()
  }

  async function bayarCicilan(e) {
    e.preventDefault()

    if (
      !formCicilan.pinjaman_id ||
      !formCicilan.nominal ||
      !formCicilan.tanggal
    ) {
      alert('Lengkapi data cicilan.')
      return
    }

    const dataPinjaman = pinjaman.find(
      (item) => item.id == formCicilan.pinjaman_id
    )

    if (!dataPinjaman) {
      alert('Data pinjaman tidak ditemukan.')
      return
    }

    const nominalBayar = Number(formCicilan.nominal)

    if (nominalBayar <= 0) {
      alert('Nominal cicilan tidak valid.')
      return
    }

    if (nominalBayar > Number(dataPinjaman.sisa || 0)) {
      alert('Nominal cicilan melebihi sisa pinjaman.')
      return
    }

    const sisaBaru = Number(dataPinjaman.sisa || 0) - nominalBayar

    const { error: errorUpdate } = await supabase
      .from('pinjaman')
      .update({
        sisa: sisaBaru,
        status: sisaBaru <= 0 ? 'lunas' : 'berjalan',
      })
      .eq('id', formCicilan.pinjaman_id)

    if (errorUpdate) {
      console.log(errorUpdate)
      alert(errorUpdate.message || 'Gagal update pinjaman.')
      return
    }

    const { error: errorCicilan } = await supabase.from('cicilan').insert([
      {
        pinjaman_id: formCicilan.pinjaman_id,
        nominal: nominalBayar,
        tanggal: formCicilan.tanggal,
      },
    ])

    if (errorCicilan) {
      console.log(errorCicilan)
      alert('Gagal menyimpan cicilan.')
      return
    }

    await supabase.from('transaksi').insert([
      {
        jenis: 'masuk',
        kategori: 'Cicilan',
        nominal: nominalBayar,
        tanggal: formCicilan.tanggal,
        keterangan: 'Pembayaran cicilan anggota',
      },
    ])

    alert('Cicilan berhasil dibayar.')

    setFormCicilan({
      pinjaman_id: '',
      nominal: '',
      tanggal: '',
    })

    getData()
  }

  function progressPinjaman(item) {
    const jumlah = Number(item.jumlah || 0)
    const sisa = Number(item.sisa || 0)

    if (jumlah <= 0) return 0

    return Math.min(100, Math.round(((jumlah - sisa) / jumlah) * 100))
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
              Kelola pinjaman, tenor, jatuh tempo, dan pembayaran cicilan anggota.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Wallet />}
          title="Pinjaman Aktif"
          value={`${pinjamanAktif.length} Data`}
          color="orange"
        />

        <StatCard
          icon={<HandCoins />}
          title="Total Pinjaman Aktif"
          value={formatRupiah(totalPinjamanAktif)}
          color="red"
        />

        <StatCard
          icon={<Clock />}
          title="Total Piutang"
          value={formatRupiah(totalPiutang)}
          color="blue"
        />

        <StatCard
          icon={<CheckCircle />}
          title="Pinjaman Lunas"
          value={`${pinjamanLunas.length} Data`}
          color="green"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <FormHeader
            icon={<Plus size={22} />}
            title="Tambah Pinjaman"
            desc="Input pinjaman baru anggota"
            color="red"
          />

          <form onSubmit={tambahPinjaman} className="space-y-4">
            <select
              value={formPinjaman.anggota_id}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  anggota_id: e.target.value,
                })
              }
              className="input-style"
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
                  ? formatRupiah(formPinjaman.nominal)
                  : ''
              }
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  nominal: angkaOnly(e.target.value),
                })
              }
              className="input-style"
            />

            <select
              value={formPinjaman.tenor}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  tenor: e.target.value,
                })
              }
              className="input-style"
            >
              <option value="">Pilih tenor</option>
              <option value="1">1 Bulan</option>
              <option value="3">3 Bulan</option>
              <option value="6">6 Bulan</option>
              <option value="12">12 Bulan</option>
              <option value="18">18 Bulan</option>
              <option value="24">24 Bulan</option>
            </select>

            <input
              type="date"
              value={formPinjaman.tanggal}
              onChange={(e) =>
                setFormPinjaman({
                  ...formPinjaman,
                  tanggal: e.target.value,
                })
              }
              className="input-style"
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
              className="input-style min-h-[90px]"
            />

            {(nominalPinjaman > 0 || tenorPinjaman > 0) && (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Angsuran / bulan</span>
                  <strong>{formatRupiah(angsuranPerBulan)}</strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-slate-500">Jatuh tempo</span>
                  <strong>{jatuhTempo || '-'}</strong>
                </div>
              </div>
            )}

            <button className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700">
              Simpan Pinjaman
            </button>
          </form>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <FormHeader
            icon={<CreditCard size={22} />}
            title="Bayar Cicilan"
            desc="Input pembayaran cicilan anggota"
            color="green"
          />

          <form onSubmit={bayarCicilan} className="space-y-4">
            <select
              value={formCicilan.pinjaman_id}
              onChange={(e) =>
                setFormCicilan({
                  ...formCicilan,
                  pinjaman_id: e.target.value,
                })
              }
              className="input-style"
            >
              <option value="">Pilih pinjaman aktif</option>
              {pinjamanAktif.map((item) => (
                <option key={item.id} value={item.id}>
  {getNamaAnggota(item.anggota_id)} - Sisa {formatRupiah(item.sisa)}
</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Rp 0"
              value={
                formCicilan.nominal
                  ? formatRupiah(formCicilan.nominal)
                  : ''
              }
              onChange={(e) =>
                setFormCicilan({
                  ...formCicilan,
                  nominal: angkaOnly(e.target.value),
                })
              }
              className="input-style"
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
              className="input-style"
            />

            <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
              Simpan Cicilan
            </button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Data Pinjaman Anggota
            </h2>
            <p className="text-sm text-slate-500">
              Riwayat pinjaman, tenor, jatuh tempo, dan progress pembayaran.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari anggota..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Anggota</th>
                <th className="p-4 text-left">Pinjaman</th>
                <th className="p-4 text-left">Tenor</th>
                <th className="p-4 text-left">Angsuran</th>
                <th className="p-4 text-left">Sisa</th>
                <th className="p-4 text-left">Jatuh Tempo</th>
                <th className="p-4 text-left">Progress</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredPinjaman.map((item) => {
                const progress = progressPinjaman(item)

                return (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {item.tanggal}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
  {getNamaAnggota(item.anggota_id)}
</td>

                    <td className="p-4 font-bold text-red-600">
                      {formatRupiah(item.jumlah)}
                    </td>

                    <td className="p-4">
                      {item.tenor ? `${item.tenor} bulan` : '-'}
                    </td>

                    <td className="p-4 font-semibold text-blue-700">
                      {formatRupiah(item.angsuran_per_bulan)}
                    </td>

                    <td className="p-4 font-bold text-orange-600">
                      {formatRupiah(item.sisa)}
                    </td>

                    <td className="p-4">
                      {item.jatuh_tempo || '-'}
                    </td>

                    <td className="p-4">
                      <div className="w-32">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {progress}%
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredPinjaman.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Wallet size={45} />
              <p className="mt-4 font-semibold">Belum ada data pinjaman</p>
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

function StatCard({ icon, title, value, color }) {
  const styles = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    red: 'border-red-100 bg-red-50 text-red-600',
    orange: 'border-orange-100 bg-orange-50 text-orange-600',
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${styles[color]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase">{title}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{value}</h3>
        </div>
      </div>
    </div>
  )
}

function FormHeader({ icon, title, desc, color }) {
  const styles = {
    red: 'bg-red-100 text-red-600',
    green: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`rounded-xl p-3 ${styles[color]}`}>{icon}</div>
      <div>
        <h2 className="font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = String(status || '').toLowerCase()

  const styles = {
    lunas: 'bg-emerald-100 text-emerald-700',
    aktif: 'bg-orange-100 text-orange-700',
    berjalan: 'bg-orange-100 text-orange-700',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {status || '-'}
    </span>
  )
}