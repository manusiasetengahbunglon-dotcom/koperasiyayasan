import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Search,
  CalendarDays,
  FileText,
  HandCoins,
  Plus,
  Eye,
  ChevronDown,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [anggota, setAnggota] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [pinjaman, setPinjaman] = useState([])
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(false)
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    getAnggota()
    getTransaksi()
    getPinjaman()
  }, [])

  async function getAnggota() {
    const { data, error } = await supabase
      .from('anggota')
      .select('*')
      .order('id', { ascending: true })

    if (!error) setAnggota(data || [])
  }

  async function getTransaksi() {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('tanggal', { ascending: true })

    if (!error) setTransaksi(data || [])
  }

  async function getPinjaman() {
    const { data, error } = await supabase
      .from('pinjaman')
      .select('*')

    if (!error) setPinjaman(data || [])
  }

  const filteredAnggota = anggota.filter((item) =>
    item.nama?.toLowerCase().includes(search.toLowerCase())
  )

  const transaksiPeriode = transaksi.filter((item) =>
    item.tanggal?.startsWith(periode)
  )

  const pinjamanAktif = pinjaman.filter(
    (item) => item.status === 'berjalan' && Number(item.sisa || 0) > 0
  )

  const totalMasuk = transaksiPeriode
    .filter((item) => item.jenis === 'masuk')
    .reduce((total, item) => total + Number(item.nominal || 0), 0)

  const totalKeluar = transaksiPeriode
    .filter((item) => item.jenis === 'keluar')
    .reduce((total, item) => total + Number(item.nominal || 0), 0)

  const saldoAkhir = totalMasuk - totalKeluar

  const chartData = [
    {
      nama: 'Masuk',
      total: totalMasuk,
    },
    {
      nama: 'Keluar',
      total: totalKeluar,
    },
    {
      nama: 'Saldo',
      total: saldoAkhir,
    },
  ]

  const namaPeriode = new Date(periode + '-01').toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const formatRupiah = (angka) => {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Ringkasan sistem
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-800 md:text-2xl">
              Koperasi Yayasan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pantau saldo, transaksi, dan data anggota yayasan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
              <CalendarDays size={17} className="text-slate-500" />

              <input
                type="month"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 md:w-auto"
              >
                <Plus size={17} />
                Transaksi Baru
                <ChevronDown size={16} />
              </button>

              {openMenu && (
                <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg md:w-52">
                  <NavLink
                    to="/admin/kas-masuk"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                  >
                    <ArrowDownCircle size={17} className="text-emerald-600" />
                    Kas Masuk
                  </NavLink>

                  <NavLink
                    to="/admin/kas-keluar"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                  >
                    <ArrowUpCircle size={17} className="text-red-600" />
                    Kas Keluar
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Wallet size={22} />}
          title="Saldo Akhir"
          value={formatRupiah(saldoAkhir)}
          note={`Periode ${namaPeriode}`}
          color="blue"
        />

        <StatCard
          icon={<ArrowDownCircle size={22} />}
          title="Total Masuk"
          value={formatRupiah(totalMasuk)}
          note={`Pemasukan ${namaPeriode}`}
          color="green"
        />

        <StatCard
          icon={<ArrowUpCircle size={22} />}
          title="Total Keluar"
          value={formatRupiah(totalKeluar)}
          note={`Pengeluaran ${namaPeriode}`}
          color="red"
        />

        <StatCard
          icon={<Users size={22} />}
          title="Jumlah Anggota"
          value={`${anggota.length} Orang`}
          note="Anggota aktif"
          color="orange"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="border-b p-4 md:p-5">
            <h2 className="font-bold text-slate-800">
              Grafik Keuangan {namaPeriode}
            </h2>

            <p className="text-xs text-slate-500">
              Perbandingan pemasukan, pengeluaran, dan saldo akhir.
            </p>
          </div>

          <div className="w-full min-h-[300px] p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="rounded-2xl border bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-bold text-slate-800">Ringkasan Bulan Ini</h2>

          <div className="mt-4 space-y-3">
            <SummaryItem
              icon={<CalendarDays size={18} />}
              label="Periode"
              value={namaPeriode}
            />

            <SummaryItem
              icon={<FileText size={18} />}
              label="Total Transaksi"
              value={transaksiPeriode.length}
            />

            <SummaryItem
              icon={<HandCoins size={18} />}
              label="Pinjaman Aktif"
              value={pinjamanAktif.length}
            />
          </div>
        </section>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Data Anggota Yayasan
              </h2>

              <p className="text-xs text-slate-500">
                Total {anggota.length} anggota terdaftar
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
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-16 p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama Anggota</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredAnggota.slice(0, 8).map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{index + 1}</td>

                    <td className="p-3 font-semibold text-slate-800">
                      {item.nama}
                    </td>

                    <td className="p-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <NavLink
                        to="/admin/anggota"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <Eye size={14} />
                        Detail
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-4 text-center">
            <NavLink
              to="/admin/anggota"
              className="inline-flex rounded-xl border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Lihat Semua Anggota
            </NavLink>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4 md:p-5">
            <h2 className="font-bold text-slate-800">
              Transaksi {namaPeriode}
            </h2>

            <p className="text-xs text-slate-500">
              Riwayat kas masuk dan kas keluar sesuai periode.
            </p>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {transaksiPeriode.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Belum ada transaksi pada periode ini.
              </div>
            ) : (
              transaksiPeriode.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.keterangan}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.tanggal} • {item.kategori}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold ${
                      item.jenis === 'masuk'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.jenis === 'masuk' ? '+' : '-'}
                    {formatRupiah(item.nominal)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, title, value, note, color }) {
  const styles = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    red: 'border-red-100 bg-red-50 text-red-600',
    orange: 'border-orange-100 bg-orange-50 text-orange-600',
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${styles[color]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase">{title}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{value}</h3>
          <p className="text-xs text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  )
}