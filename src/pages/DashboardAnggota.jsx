import { useEffect, useState } from 'react'
import {
  Wallet,
  HandCoins,
  Scale,
  CalendarDays,
  LogOut,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function DashboardAnggota({ profile, logout }) {
  const [simpanan, setSimpanan] = useState([])
  const [pinjaman, setPinjaman] = useState([])
  const [cicilan, setCicilan] = useState([])

  useEffect(() => {
    if (profile?.anggota_id) {
      getDataAnggota()
    }
  }, [profile])

  async function getDataAnggota() {
    const { data: dataSimpanan } = await supabase
      .from('simpanan')
      .select('*')
      .eq('anggota_id', profile.anggota_id)
      .order('tanggal', { ascending: false })

    const { data: dataPinjaman } = await supabase
      .from('pinjaman')
      .select('*')
      .eq('anggota_id', profile.anggota_id)
      .order('tanggal', { ascending: false })

    const pinjamanIds = (dataPinjaman || []).map((item) => item.id)

    let dataCicilan = []

    if (pinjamanIds.length > 0) {
      const { data } = await supabase
        .from('cicilan')
        .select('*')
        .in('pinjaman_id', pinjamanIds)
        .order('tanggal', { ascending: false })

      dataCicilan = data || []
    }

    setSimpanan(dataSimpanan || [])
    setPinjaman(dataPinjaman || [])
    setCicilan(dataCicilan || [])
  }

  function formatRupiah(angka) {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  const totalSimpanan = simpanan.reduce(
    (total, item) =>
      total + Number(item.setor || 0) - Number(item.tarik || 0),
    0
  )

  const sisaPinjaman = pinjaman
    .filter((item) => item.status !== 'lunas')
    .reduce((total, item) => total + Number(item.sisa || 0), 0)

  const saldoBersih = totalSimpanan - sisaPinjaman

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-3xl bg-white p-6 shadow-sm border">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Dashboard Anggota
              </p>

              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-800">
                Halo, {profile?.nama || 'Anggota'}
              </h1>

              <p className="mt-2 text-slate-500">
                Lihat simpanan, pinjaman, dan riwayat transaksi pribadi.
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </section>

        {!profile?.anggota_id && (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
            Akun ini belum terhubung ke data anggota. Pastikan kolom
            <strong> anggota_id </strong>
            di tabel profiles sudah terisi.
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            icon={<Wallet />}
            title="Total Simpanan"
            value={formatRupiah(totalSimpanan)}
            color="blue"
          />

          <Card
            icon={<HandCoins />}
            title="Sisa Pinjaman"
            value={formatRupiah(sisaPinjaman)}
            color="orange"
          />

          <Card
            icon={<Scale />}
            title="Saldo Bersih"
            value={formatRupiah(saldoBersih)}
            color={saldoBersih < 0 ? 'red' : 'green'}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Box title="Riwayat Simpanan">
            {simpanan.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="mt-4 space-y-3">
                {simpanan.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.jenis || 'Simpanan'}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.tanggal}
                      </p>
                    </div>

                    <p className="font-bold text-blue-700">
                      {formatRupiah(
                        Number(item.setor || 0) - Number(item.tarik || 0)
                      )}
                    </p>
                  </div>
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
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        Pembayaran Cicilan
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.tanggal}
                      </p>
                    </div>

                    <p className="font-bold text-emerald-700">
                      {formatRupiah(item.nominal)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Box>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <HandCoins size={18} className="text-orange-600" />

            <h2 className="font-bold text-slate-800">
              Data Pinjaman
            </h2>
          </div>

          {pinjaman.length === 0 ? (
            <EmptyText />
          ) : (
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
                  {pinjaman.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.tanggal}</td>

                      <td className="p-3 font-bold text-red-600">
                        {formatRupiah(item.jumlah)}
                      </td>

                      <td className="p-3 font-bold text-orange-600">
                        {formatRupiah(item.sisa)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'lunas'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
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

      <h2 className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </h2>
    </div>
  )
}

function Box({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarDays size={18} className="text-blue-600" />

        <h2 className="font-bold text-slate-800">
          {title}
        </h2>
      </div>

      {children}
    </div>
  )
}

function EmptyText() {
  return (
    <div className="mt-10 text-center text-sm text-slate-400">
      Belum ada data.
    </div>
  )
}