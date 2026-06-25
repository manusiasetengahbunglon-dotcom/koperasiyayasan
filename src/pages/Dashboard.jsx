import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Wallet,
  Users,
  Search,
  CalendarDays,
  FileText,
  HandCoins,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Eye,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [anggota, setAnggota] = useState([])
  const [transaksi, setTransaksi] = useState([])
  const [simpanan, setSimpanan] = useState([])
  const [pinjaman, setPinjaman] = useState([])
  const [cicilan, setCicilan] = useState([])
  const [pengajuan, setPengajuan] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    getDashboardData()
  }, [])

  async function getDashboardData() {
    setLoading(true)

    const [resAnggota, resTransaksi, resSimpanan, resPinjaman, resCicilan, resPengajuan] =
  await Promise.all([
    supabase.from('anggota').select('*').order('id', { ascending: true }),

    supabase.from('transaksi').select('*').order('tanggal', { ascending: false }),

    supabase.from('simpanan').select('*').order('tanggal', { ascending: false }),

    supabase.from('pinjaman').select('*').order('tanggal', { ascending: false }),

    supabase.from('cicilan').select('*').order('tanggal', { ascending: false }),

    supabase
      .from('pengajuan_pinjaman')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

    setAnggota(resAnggota.data || [])
    setTransaksi(resTransaksi.data || [])
    setSimpanan(resSimpanan.data || [])
    setPinjaman(resPinjaman.data || [])
    setCicilan(resCicilan.data || [])
    setPengajuan(resPengajuan.data || [])
    setLoading(false)
  }

  const namaPeriode = new Date(periode + '-01').toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const formatRupiah = (angka) =>
    'Rp' + Number(angka || 0).toLocaleString('id-ID')
  function getNamaAnggota(id) {
  const data = anggota.find(
    (item) => Number(item.id) === Number(id)
  )

  return data?.nama || '-'
}

function getTeleponAnggota(id) {
  const data = anggota.find(
    (item) => Number(item.id) === Number(id)
  )

  return data?.telepon || ''
}

  const filteredAnggota = anggota.filter((item) =>
    item.nama?.toLowerCase().includes(search.toLowerCase())
  )

  const transaksiPeriode = transaksi.filter((item) => item.tanggal?.startsWith(periode))
  const simpananPeriode = simpanan.filter((item) => item.tanggal?.startsWith(periode))
  const pinjamanPeriode = pinjaman.filter((item) => item.tanggal?.startsWith(periode))
  const cicilanPeriode = cicilan.filter((item) => item.tanggal?.startsWith(periode))

  const totalMasuk = useMemo(() => {
    const kasMasuk = transaksiPeriode
      .filter((item) => item.jenis === 'masuk')
      .reduce((total, item) => total + Number(item.nominal || 0), 0)

    const setorSimpanan = simpananPeriode.reduce(
      (total, item) => total + Number(item.setor || 0),
      0
    )

    const cicilanMasuk = cicilanPeriode.reduce(
      (total, item) => total + Number(item.nominal || 0),
      0
    )

    return kasMasuk + setorSimpanan + cicilanMasuk
  }, [transaksiPeriode, simpananPeriode, cicilanPeriode])

  const totalKeluar = useMemo(() => {
    const kasKeluar = transaksiPeriode
      .filter((item) => item.jenis === 'keluar')
      .reduce((total, item) => total + Number(item.nominal || 0), 0)

    const tarikSimpanan = simpananPeriode.reduce(
      (total, item) => total + Number(item.tarik || 0),
      0
    )

    const pinjamanDicairkan = pinjamanPeriode.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0
    )

    return kasKeluar + tarikSimpanan + pinjamanDicairkan
  }, [transaksiPeriode, simpananPeriode, pinjamanPeriode])

  const saldoKoperasi = useMemo(() => {
    const kasMasuk = transaksi
      .filter((item) => item.jenis === 'masuk')
      .reduce((total, item) => total + Number(item.nominal || 0), 0)

    const kasKeluar = transaksi
      .filter((item) => item.jenis === 'keluar')
      .reduce((total, item) => total + Number(item.nominal || 0), 0)

    const setor = simpanan.reduce((total, item) => total + Number(item.setor || 0), 0)
    const tarik = simpanan.reduce((total, item) => total + Number(item.tarik || 0), 0)
    const cair = pinjaman.reduce((total, item) => total + Number(item.jumlah || 0), 0)
    const bayar = cicilan.reduce((total, item) => total + Number(item.nominal || 0), 0)

    return kasMasuk + setor + bayar - kasKeluar - tarik - cair
  }, [transaksi, simpanan, pinjaman, cicilan])

  const saldoPeriode = totalMasuk - totalKeluar

  const pinjamanAktif = pinjaman.filter(
    (item) =>
      ['aktif', 'berjalan'].includes(String(item.status).toLowerCase()) &&
      Number(item.sisa || 0) > 0
  )

  const pengajuanMenunggu = pengajuan.filter((item) => item.status === 'menunggu')

  const pinjamanLewatTempo = pinjamanAktif.filter((item) => {
    const jatuhTempo = hitungJatuhTempo(item.tanggal, item.tenor)
    return jatuhTempo && new Date(jatuhTempo) < new Date()
  })

  function hitungJatuhTempo(tanggal, tenor) {
    if (!tanggal || !tenor) return null
    const date = new Date(tanggal)
    date.setMonth(date.getMonth() + Number(tenor))
    return date.toISOString().slice(0, 10)
  }

  function formatTeleponWA(nomor) {
    if (!nomor) return ''
    let clean = String(nomor).replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    if (!clean.startsWith('62')) clean = '62' + clean
    return clean
  }

  function bukaReminderWA(item) {
    const nomor = formatTeleponWA(
  getTeleponAnggota(item.anggota_id)
)
    if (!nomor) {
      alert('Nomor telepon anggota belum tersedia.')
      return
    }

    const jatuhTempo = hitungJatuhTempo(item.tanggal, item.tenor)

    const pesan = `Halo ${getNamaAnggota(item.anggota_id) || 'Anggota'}, kami dari Koperasi Yayasan ingin mengingatkan bahwa pinjaman Anda sebesar ${formatRupiah(item.jumlah)} masih memiliki sisa ${formatRupiah(item.sisa)} dan telah melewati jatuh tempo pada ${jatuhTempo}. Mohon segera melakukan pembayaran cicilan. Terima kasih.`

    window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`, '_blank')
  }

  async function setujuiPengajuan(item) {
    const punyaPinjamanAktif = pinjamanAktif.some(
      (pinjam) => pinjam.anggota_id === item.anggota_id
    )

    if (punyaPinjamanAktif) {
      alert('Pengajuan tidak bisa disetujui karena anggota masih memiliki pinjaman aktif.')
      return
    }

    const konfirmasi = confirm(
      `Setujui pengajuan ${getNamaAnggota(item.anggota_id) || 'anggota'} sebesar ${formatRupiah(item.nominal)}?`
    )

    if (!konfirmasi) return

    const tanggalHariIni = new Date().toISOString().slice(0, 10)

    const { error: insertError } = await supabase.from('pinjaman').insert({
      anggota_id: item.anggota_id,
      tanggal: tanggalHariIni,
      jumlah: Number(item.nominal),
      tenor: Number(item.tenor),
      sisa: Number(item.nominal),
      status: 'berjalan',
    })

    if (insertError) {
      alert('Gagal memasukkan data pinjaman.')
      console.log(insertError)
      return
    }

    const { error: updateError } = await supabase
      .from('pengajuan_pinjaman')
      .update({ status: 'disetujui' })
      .eq('id', item.id)

    if (updateError) {
      alert('Pinjaman masuk, tetapi status pengajuan gagal diperbarui.')
      console.log(updateError)
      return
    }

    alert('Pengajuan berhasil disetujui.')
    getDashboardData()
  }

  async function tolakPengajuan(item) {
    const konfirmasi = confirm(`Tolak pengajuan ${getNamaAnggota(item.anggota_id) || 'anggota'}?`)
    if (!konfirmasi) return

    const { error } = await supabase
      .from('pengajuan_pinjaman')
      .update({ status: 'ditolak' })
      .eq('id', item.id)

    if (error) {
      alert('Gagal menolak pengajuan.')
      console.log(error)
      return
    }

    alert('Pengajuan berhasil ditolak.')
    getDashboardData()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Dashboard Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Koperasi Yayasan
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan saldo, anggota, pengajuan pinjaman, dan pengingat tagihan.
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

            <button
              onClick={getDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              <RefreshCw size={17} />
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Wallet size={22} />}
          title="Saldo Koperasi"
          value={formatRupiah(saldoKoperasi)}
          note="Saldo keseluruhan"
          color="blue"
        />

        <StatCard
          icon={<FileText size={22} />}
          title="Saldo Periode"
          value={formatRupiah(saldoPeriode)}
          note={namaPeriode}
          color={saldoPeriode < 0 ? 'red' : 'green'}
        />

        <StatCard
          icon={<Users size={22} />}
          title="Anggota"
          value={`${anggota.length} Orang`}
          note="Terdaftar"
          color="orange"
        />

        <StatCard
          icon={<Clock size={22} />}
          title="Pengajuan"
          value={`${pengajuanMenunggu.length} Menunggu`}
          note="Butuh diproses"
          color="blue"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniInfo title="Total Masuk Periode" value={formatRupiah(totalMasuk)} />
        <MiniInfo title="Total Keluar Periode" value={formatRupiah(totalKeluar)} />
        <MiniInfo title="Pinjaman Lewat Tempo" value={`${pinjamanLewatTempo.length} Data`} danger />
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <SectionHeader
          title="Pengajuan Pinjaman"
          desc="Pengajuan dari dashboard anggota. Admin dapat menyetujui atau menolak."
        />

        {pengajuan.length === 0 ? (
          <EmptyText text="Belum ada pengajuan pinjaman." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Anggota</th>
                  <th className="p-3 text-left">Nominal</th>
                  <th className="p-3 text-left">Tenor</th>
                  <th className="p-3 text-left">Alasan</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {pengajuan.slice(0, 6).map((item) => {
                  const punyaPinjamanAktif = pinjamanAktif.some(
                    (pinjam) => pinjam.anggota_id === item.anggota_id
                  )

                  return (
                    <tr key={item.id} className="border-t hover:bg-slate-50">
                      <td className="p-3">{item.tanggal}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        {getNamaAnggota(item.anggota_id) || '-'}
                        {punyaPinjamanAktif && item.status === 'menunggu' && (
                          <p className="text-xs font-normal text-red-500">
                            Masih punya pinjaman aktif
                          </p>
                        )}
                      </td>
                      <td className="p-3 font-bold text-blue-700">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="p-3">{item.tenor} Bulan</td>
                      <td className="p-3">{item.alasan || '-'}</td>
                      <td className="p-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3">
                        {item.status === 'menunggu' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setujuiPengajuan(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle size={14} />
                              Setujui
                            </button>

                            <button
                              onClick={() => tolakPengajuan(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              <XCircle size={14} />
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Selesai</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <SectionHeader
          title="Pengingat Tagihan Pinjaman"
          desc="Pinjaman aktif yang sudah melewati estimasi jatuh tempo."
        />

        {pinjamanLewatTempo.length === 0 ? (
          <EmptyText text="Tidak ada pinjaman lewat tempo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3 text-left">Anggota</th>
                  <th className="p-3 text-left">Jumlah</th>
                  <th className="p-3 text-left">Sisa</th>
                  <th className="p-3 text-left">Jatuh Tempo</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Reminder</th>
                </tr>
              </thead>

              <tbody>
                {pinjamanLewatTempo.slice(0, 6).map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">
                      {getNamaAnggota(item.anggota_id) || '-'}
                    </td>
                    <td className="p-3">{formatRupiah(item.jumlah)}</td>
                    <td className="p-3 font-bold text-red-600">
                      {formatRupiah(item.sisa)}
                    </td>
                    <td className="p-3">{hitungJatuhTempo(item.tanggal, item.tenor)}</td>
                    <td className="p-3">
                      <StatusBadge status="Lewat Tempo" />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => bukaReminderWA(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        <MessageCircle size={14} />
                        Kirim WA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <SectionHeader
            title="Data Anggota"
            desc={`Total ${anggota.length} anggota terdaftar.`}
          />

          <div className="border-b px-4 pb-4">
            <div className="flex max-w-sm items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm">
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
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-16 p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredAnggota.slice(0, 5).map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.nama}</td>
                    <td className="p-3">
                      <StatusBadge status={item.status || 'aktif'} />
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
        </div>

        <div className="rounded-2xl border bg-white shadow-sm">
          <SectionHeader
            title={`Transaksi ${namaPeriode}`}
            desc="Kas masuk dan keluar periode ini."
          />

          <div className="max-h-[340px] overflow-y-auto">
            {transaksiPeriode.length === 0 ? (
              <EmptyText text="Belum ada transaksi periode ini." />
            ) : (
              transaksiPeriode.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.keterangan || item.kategori}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.tanggal} • {item.kategori}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold ${
                      item.jenis === 'masuk' ? 'text-emerald-600' : 'text-red-600'
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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
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

function MiniInfo({ title, value, danger }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className={`mt-1 text-xl font-bold ${danger ? 'text-red-600' : 'text-slate-800'}`}>
        {value}
      </h3>
    </div>
  )
}

function SectionHeader({ title, desc }) {
  return (
    <div className="border-b p-4">
      <h2 className="font-bold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = String(status || '').toLowerCase()

  const styles = {
    menunggu: 'bg-blue-50 text-blue-700',
    disetujui: 'bg-emerald-50 text-emerald-700',
    ditolak: 'bg-red-50 text-red-700',
    aktif: 'bg-orange-50 text-orange-700',
    berjalan: 'bg-orange-50 text-orange-700',
    lunas: 'bg-emerald-50 text-emerald-700',
    'lewat tempo': 'bg-red-50 text-red-700',
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

function EmptyText({ text }) {
  return <div className="p-6 text-center text-sm text-slate-400">{text}</div>
}