import { useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  HandCoins,
  Scale,
  CalendarDays,
  LogOut,
  Send,
  Building2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function DashboardAnggota({ profile, logout }) {
  const [simpanan, setSimpanan] = useState([])
  const [pinjaman, setPinjaman] = useState([])
  const [cicilan, setCicilan] = useState([])
  const [pengajuan, setPengajuan] = useState([])

  const [saldoKoperasi, setSaldoKoperasi] = useState(0)
  const [totalPinjamanKoperasi, setTotalPinjamanKoperasi] = useState(0)

  const [nominalPinjaman, setNominalPinjaman] = useState('')
  const [tenor, setTenor] = useState('')
  const [alasan, setAlasan] = useState('')

  const [loadingData, setLoadingData] = useState(false)
  const [loadingAjukan, setLoadingAjukan] = useState(false)

  useEffect(() => {
    if (profile?.anggota_id) {
      getDataAnggota()
    }
  }, [profile])

  async function getDataAnggota() {
    setLoadingData(true)

    const [
      resSimpanan,
      resPinjaman,
      resPengajuan,
      resSemuaSimpanan,
      resSemuaPinjaman,
      resSemuaCicilan,
      resTransaksi,
    ] = await Promise.all([
      supabase
        .from('simpanan')
        .select('*')
        .eq('anggota_id', profile.anggota_id)
        .order('tanggal', { ascending: false }),

      supabase
        .from('pinjaman')
        .select('*')
        .eq('anggota_id', profile.anggota_id)
        .order('tanggal', { ascending: false }),

      supabase
        .from('pengajuan_pinjaman')
        .select('*')
        .eq('anggota_id', profile.anggota_id)
        .order('created_at', { ascending: false }),

      supabase.from('simpanan').select('setor, tarik'),
      supabase.from('pinjaman').select('jumlah, sisa, status'),
      supabase.from('cicilan').select('nominal'),
      supabase.from('transaksi').select('jenis, nominal'),
    ])

    const dataSimpanan = resSimpanan.data || []
    const dataPinjaman = resPinjaman.data || []
    const dataPengajuan = resPengajuan.data || []

    const pinjamanIds = dataPinjaman.map((item) => item.id)

    let dataCicilan = []

    if (pinjamanIds.length > 0) {
      const { data } = await supabase
        .from('cicilan')
        .select('*')
        .in('pinjaman_id', pinjamanIds)
        .order('tanggal', { ascending: false })

      dataCicilan = data || []
    }

    const semuaSimpanan = resSemuaSimpanan.data || []
    const semuaPinjaman = resSemuaPinjaman.data || []
    const semuaCicilan = resSemuaCicilan.data || []
    const semuaTransaksi = resTransaksi.data || []

    const totalSimpananKoperasi = semuaSimpanan.reduce(
      (total, item) =>
        total + Number(item.setor || 0) - Number(item.tarik || 0),
      0
    )

    const totalPinjamanDicairkan = semuaPinjaman.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0
    )

    const totalCicilanMasuk = semuaCicilan.reduce(
      (total, item) => total + Number(item.nominal || 0),
      0
    )

    const totalSisaPinjamanKoperasi = semuaPinjaman
      .filter((item) => String(item.status).toLowerCase() !== 'lunas')
      .reduce((total, item) => total + Number(item.sisa || 0), 0)

    setSimpanan(dataSimpanan)
    setPinjaman(dataPinjaman)
    setCicilan(dataCicilan)
    setPengajuan(dataPengajuan)

    const kasMasuk = semuaTransaksi
  .filter((item) => item.jenis === 'masuk')
  .reduce((total, item) => total + Number(item.nominal || 0), 0)

const kasKeluar = semuaTransaksi
  .filter((item) => item.jenis === 'keluar')
  .reduce((total, item) => total + Number(item.nominal || 0), 0)
    setSaldoKoperasi(
  kasMasuk +
    totalSimpananKoperasi +
    totalCicilanMasuk -
    kasKeluar -
    totalPinjamanDicairkan
)

    setTotalPinjamanKoperasi(totalSisaPinjamanKoperasi)
    setLoadingData(false)
  }

  const totalSimpanan = useMemo(() => {
    return simpanan.reduce(
      (total, item) =>
        total + Number(item.setor || 0) - Number(item.tarik || 0),
      0
    )
  }, [simpanan])

  const pinjamanAktif = useMemo(() => {
    return pinjaman.filter(
      (item) =>
        ['aktif', 'berjalan'].includes(String(item.status).toLowerCase()) &&
        Number(item.sisa || 0) > 0
    )
  }, [pinjaman])

  const sisaPinjaman = useMemo(() => {
    return pinjamanAktif.reduce(
      (total, item) => total + Number(item.sisa || 0),
      0
    )
  }, [pinjamanAktif])

  const totalCicilan = useMemo(() => {
    return cicilan.reduce(
      (total, item) => total + Number(item.nominal || 0),
      0
    )
  }, [cicilan])

  const pengajuanMenunggu = pengajuan.filter(
    (item) => item.status === 'menunggu'
  )

  const saldoBersih = totalSimpanan - sisaPinjaman

  const tidakBisaAjukan =
    pinjamanAktif.length > 0 || pengajuanMenunggu.length > 0

  async function ajukanPinjaman(e) {
    e.preventDefault()

    if (!profile?.anggota_id) {
      alert('Akun belum terhubung ke data anggota.')
      return
    }

    if (pinjamanAktif.length > 0) {
      alert('Tidak bisa mengajukan pinjaman karena masih ada pinjaman aktif.')
      return
    }

    if (pengajuanMenunggu.length > 0) {
      alert('Tidak bisa mengajukan lagi karena masih ada pengajuan menunggu.')
      return
    }

    if (!nominalPinjaman || !tenor || !alasan) {
      alert('Nominal, tenor, dan alasan wajib diisi.')
      return
    }

    if (Number(nominalPinjaman) <= 0) {
      alert('Nominal pinjaman tidak valid.')
      return
    }

    setLoadingAjukan(true)

    const { error } = await supabase.from('pengajuan_pinjaman').insert({
      anggota_id: profile.anggota_id,
      nominal: Number(nominalPinjaman),
      tenor: Number(tenor),
      alasan,
      status: 'menunggu',
      
    })

    setLoadingAjukan(false)

    if (error) {
      alert('Gagal mengajukan pinjaman.')
      console.log(error)
      return
    }

    alert('Pengajuan pinjaman berhasil dikirim ke admin.')

    setNominalPinjaman('')
    setTenor('')
    setAlasan('')
    getDataAnggota()
  }

  function formatRupiah(angka) {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Portal Anggota Koperasi
              </p>

              <h1 className="mt-1 text-2xl font-bold md:text-4xl">
                Halo, {profile?.nama || 'Anggota'}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
                Pantau simpanan, pinjaman, cicilan, dan ajukan pinjaman secara digital.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={getDataAnggota}
                disabled={loadingData}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 font-semibold hover:bg-white/25 disabled:opacity-60"
              >
                <RefreshCw size={18} />
                {loadingData ? 'Memuat...' : 'Refresh'}
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-semibold hover:bg-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </section>

        {!profile?.anggota_id && (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
            Akun ini belum terhubung ke data anggota. Pastikan kolom
            <strong> anggota_id </strong> di tabel profiles sudah terisi.
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card icon={<Wallet />} title="Simpanan Saya" value={formatRupiah(totalSimpanan)} color="blue" />
          <Card icon={<HandCoins />} title="Sisa Pinjaman" value={formatRupiah(sisaPinjaman)} color="orange" />
          <Card icon={<Scale />} title="Saldo Bersih" value={formatRupiah(saldoBersih)} color={saldoBersih < 0 ? 'red' : 'green'} />
          <Card icon={<TrendingUp />} title="Cicilan Dibayar" value={formatRupiah(totalCicilan)} color="green" />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card icon={<Building2 />} title="Saldo Koperasi" value={formatRupiah(saldoKoperasi)} color="green" />
          <Card icon={<HandCoins />} title="Pinjaman Koperasi" value={formatRupiah(totalPinjamanKoperasi)} color="orange" />
          <Card icon={<Send />} title="Pengajuan Saya" value={`${pengajuanMenunggu.length} Menunggu`} color="blue" />
        </section>

        {tidakBisaAjukan && (
          <section className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-orange-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">
              Pengajuan pinjaman belum dapat dilakukan karena masih ada pinjaman aktif
              atau pengajuan yang sedang menunggu persetujuan admin.
            </p>
          </section>
        )}

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Pengajuan Pinjaman
            </h2>
            <p className="text-sm text-slate-500">
              Data pengajuan akan langsung masuk ke dashboard admin.
            </p>
          </div>

          <form onSubmit={ajukanPinjaman} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputGroup label="Nominal Pinjaman">
              <input
                type="number"
                value={nominalPinjaman}
                onChange={(e) => setNominalPinjaman(e.target.value)}
                placeholder="Contoh: 1000000"
                disabled={tidakBisaAjukan}
                className="input-style"
              />
            </InputGroup>

            <InputGroup label="Tenor Pinjaman">
              <select
                value={tenor}
                onChange={(e) => setTenor(e.target.value)}
                disabled={tidakBisaAjukan}
                className="input-style"
              >
                <option value="">Pilih tenor</option>
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan</option>
              </select>
            </InputGroup>

            <InputGroup label="Alasan Pengajuan">
              <input
                type="text"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Contoh: Modal usaha"
                disabled={tidakBisaAjukan}
                className="input-style"
              />
            </InputGroup>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loadingAjukan || tidakBisaAjukan}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                <Send size={18} />
                {loadingAjukan ? 'Mengirim...' : 'Ajukan Pinjaman'}
              </button>
            </div>
          </form>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Box title="Riwayat Simpanan">
            {simpanan.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="mt-4 space-y-3">
                {simpanan.map((item) => (
                  <ListItem
                    key={item.id}
                    title={item.jenis || 'Simpanan'}
                    date={item.tanggal}
                    value={formatRupiah(Number(item.setor || 0) - Number(item.tarik || 0))}
                    color="blue"
                  />
                ))}
              </div>
            )}
          </Box>

          <Box title="Riwayat Cicilan">
            {cicilan.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="mt-4 space-y-3">
                {cicilan.map((item) => (
                  <ListItem
                    key={item.id}
                    title="Pembayaran Cicilan"
                    date={item.tanggal}
                    value={formatRupiah(item.nominal)}
                    color="green"
                  />
                ))}
              </div>
            )}
          </Box>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-800">Riwayat Pengajuan Pinjaman</h2>
          </div>

          {pengajuan.length === 0 ? (
            <EmptyText />
          ) : (
            <TablePengajuan data={pengajuan} formatRupiah={formatRupiah} />
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <HandCoins size={18} className="text-orange-600" />
            <h2 className="font-bold text-slate-800">Data Pinjaman</h2>
          </div>

          {pinjaman.length === 0 ? (
            <EmptyText />
          ) : (
            <TablePinjaman data={pinjaman} formatRupiah={formatRupiah} />
          )}
        </section>
      </div>
    </div>
  )
}

function TablePengajuan({ data, formatRupiah }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[750px] text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="p-3 text-left">Tanggal</th>
            <th className="p-3 text-left">Nominal</th>
            <th className="p-3 text-left">Tenor</th>
            <th className="p-3 text-left">Alasan</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.tanggal}</td>
              <td className="p-3 font-bold text-blue-700">
                {formatRupiah(item.nominal)}
              </td>
              <td className="p-3">{item.tenor} bulan</td>
              <td className="p-3">{item.alasan || '-'}</td>
              <td className="p-3">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablePinjaman({ data, formatRupiah }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[650px] text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="p-3 text-left">Tanggal</th>
            <th className="p-3 text-left">Jumlah</th>
            <th className="p-3 text-left">Sisa</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.tanggal}</td>
              <td className="p-3 font-bold text-red-600">
                {formatRupiah(item.jumlah)}
              </td>
              <td className="p-3 font-bold text-orange-600">
                {formatRupiah(item.sisa)}
              </td>
              <td className="p-3">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Card({ icon, title, value, color }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color]}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">{value}</h2>
    </div>
  )
}

function Box({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarDays size={18} className="text-blue-600" />
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function InputGroup({ label, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function ListItem({ title, date, value, color }) {
  const colors = {
    blue: 'text-blue-700',
    green: 'text-emerald-700',
    orange: 'text-orange-700',
  }

  return (
    <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <p className={`font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = String(status || '').toLowerCase()

  const styles = {
    lunas: 'bg-emerald-50 text-emerald-700',
    aktif: 'bg-orange-50 text-orange-700',
    berjalan: 'bg-orange-50 text-orange-700',
    menunggu: 'bg-blue-50 text-blue-700',
    disetujui: 'bg-emerald-50 text-emerald-700',
    ditolak: 'bg-red-50 text-red-700',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[value] || 'bg-slate-100 text-slate-600'}`}>
      {status || '-'}
    </span>
  )
}

function EmptyText() {
  return (
    <div className="mt-10 text-center text-sm text-slate-400">
      Belum ada data.
    </div>
  )
}