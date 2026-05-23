import { useEffect, useState } from 'react'
import {
  FileText,
  CalendarDays,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Download,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../supabaseClient'

export default function Laporan() {
  const [transaksi, setTransaksi] = useState([])
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    getTransaksi()
  }, [])

  async function getTransaksi() {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('tanggal', { ascending: false })

    if (!error) setTransaksi(data || [])
  }

  const transaksiPeriode = transaksi.filter((item) =>
    item.tanggal?.startsWith(periode)
  )

  const totalMasuk = transaksiPeriode
    .filter((item) => item.jenis === 'masuk')
    .reduce((total, item) => total + Number(item.nominal || 0), 0)

  const totalKeluar = transaksiPeriode
    .filter((item) => item.jenis === 'keluar')
    .reduce((total, item) => total + Number(item.nominal || 0), 0)

  const saldoAkhir = totalMasuk - totalKeluar

  const namaPeriode = new Date(periode + '-01').toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  function formatRupiah(angka) {
    return 'Rp' + Number(angka || 0).toLocaleString('id-ID')
  }

  function exportExcel() {
    const dataExcel = transaksiPeriode.map((item) => ({
      Tanggal: item.tanggal,
      Jenis: item.jenis,
      Kategori: item.kategori,
      Keterangan: item.keterangan,
      Nominal: item.jenis === 'masuk'
        ? Number(item.nominal)
        : -Number(item.nominal),
    }))

    dataExcel.push({
      Tanggal: '',
      Jenis: '',
      Kategori: '',
      Keterangan: 'Total Masuk',
      Nominal: totalMasuk,
    })

    dataExcel.push({
      Tanggal: '',
      Jenis: '',
      Kategori: '',
      Keterangan: 'Total Keluar',
      Nominal: totalKeluar,
    })

    dataExcel.push({
      Tanggal: '',
      Jenis: '',
      Kategori: '',
      Keterangan: 'Saldo Akhir',
      Nominal: saldoAkhir,
    })

    const worksheet = XLSX.utils.json_to_sheet(dataExcel)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan')
    XLSX.writeFile(workbook, `laporan-keuangan-${periode}.xlsx`)
  }

  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('LAPORAN KEUANGAN YAYASAN', 105, 15, {
      align: 'center',
    })

    doc.setFontSize(10)
    doc.text(`Periode ${namaPeriode}`, 105, 22, {
      align: 'center',
    })

    autoTable(doc, {
      startY: 32,
      head: [['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal']],
      body: transaksiPeriode.map((item) => [
        item.tanggal,
        item.jenis,
        item.kategori,
        item.keterangan,
        `${item.jenis === 'masuk' ? '+' : '-'}${formatRupiah(item.nominal)}`,
      ]),
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      body: [
        ['Total Masuk', formatRupiah(totalMasuk)],
        ['Total Keluar', formatRupiah(totalKeluar)],
        ['Saldo Akhir', formatRupiah(saldoAkhir)],
      ],
    })

    doc.save(`laporan-keuangan-${periode}.pdf`)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Laporan Keuangan
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Laporan Bulanan Yayasan
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Export laporan keuangan ke Excel atau PDF.
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
              onClick={exportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Download size={17} />
              Excel
            </button>

            <button
              onClick={exportPDF}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Download size={17} />
              PDF
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 border-b pb-5">
          <h2 className="text-center text-2xl font-bold text-slate-800">
            LAPORAN KEUANGAN YAYASAN
          </h2>

          <p className="mt-1 text-center text-sm text-slate-500">
            Periode {namaPeriode}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard
            icon={<ArrowDownCircle size={22} />}
            title="Total Masuk"
            value={formatRupiah(totalMasuk)}
            color="green"
          />

          <ReportCard
            icon={<ArrowUpCircle size={22} />}
            title="Total Keluar"
            value={formatRupiah(totalKeluar)}
            color="red"
          />

          <ReportCard
            icon={<Wallet size={22} />}
            title="Saldo Akhir"
            value={formatRupiah(saldoAkhir)}
            color="blue"
          />

          <ReportCard
            icon={<FileText size={22} />}
            title="Transaksi"
            value={`${transaksiPeriode.length} Data`}
            color="orange"
          />
        </div>

        <div className="mt-7 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Jenis</th>
                <th className="p-4 text-left">Kategori</th>
                <th className="p-4 text-left">Keterangan</th>
                <th className="p-4 text-left">Nominal</th>
              </tr>
            </thead>

            <tbody>
              {transaksiPeriode.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.jenis === 'masuk'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.jenis}
                    </span>
                  </td>

                  <td className="p-4">{item.kategori}</td>

                  <td className="p-4 font-medium text-slate-700">
                    {item.keterangan}
                  </td>

                  <td
                    className={`p-4 font-bold ${
                      item.jenis === 'masuk'
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {item.jenis === 'masuk' ? '+' : '-'}
                    {formatRupiah(item.nominal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transaksiPeriode.length === 0 && (
            <div className="py-14 text-center text-sm text-slate-400">
              Belum ada transaksi pada periode ini.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ReportCard({ icon, title, value, color }) {
  const styles = {
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
  }

  return (
    <div className={`rounded-2xl border p-4 ${styles[color]}`}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>

      <p className="text-sm font-semibold">{title}</p>
      <h3 className="mt-1 text-xl font-bold text-slate-900">{value}</h3>
    </div>
  )
}