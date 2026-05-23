import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Pencil,
  Power,
  X,
  Save,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function DataAnggota() {
  const [anggota, setAnggota] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
    tanggal_lahir: '',
    catatan: '',
    status: 'aktif',
  })

  useEffect(() => {
    getAnggota()
  }, [])

  async function getAnggota() {
    const { data, error } = await supabase
      .from('anggota')
      .select('*')
      .order('id', { ascending: true })

    if (!error) setAnggota(data || [])
  }

  function resetForm() {
    setForm({
      nama: '',
      no_hp: '',
      alamat: '',
      tanggal_lahir: '',
      catatan: '',
      status: 'aktif',
    })
    setEditId(null)
    setShowForm(false)
  }

  async function simpanAnggota(e) {
    e.preventDefault()

    if (!form.nama) {
      alert('Nama anggota wajib diisi')
      return
    }

    if (editId) {
      const { error } = await supabase
        .from('anggota')
        .update(form)
        .eq('id', editId)

      if (error) {
        alert('Gagal update anggota')
        return
      }

      alert('Data anggota berhasil diupdate')
    } else {
      const { error } = await supabase
        .from('anggota')
        .insert([form])

      if (error) {
        alert('Gagal tambah anggota')
        return
      }

      alert('Anggota berhasil ditambahkan')
    }

    resetForm()
    getAnggota()
  }

  function editAnggota(item) {
    setEditId(item.id)
    setShowForm(true)
    setForm({
      nama: item.nama || '',
      no_hp: item.no_hp || '',
      alamat: item.alamat || '',
      tanggal_lahir: item.tanggal_lahir || '',
      catatan: item.catatan || '',
      status: item.status || 'aktif',
    })
  }

  async function toggleStatus(item) {
    const statusBaru = item.status === 'aktif' ? 'nonaktif' : 'aktif'

    const konfirmasi = confirm(
      `Yakin ingin ${statusBaru === 'aktif' ? 'mengaktifkan' : 'menonaktifkan'} ${item.nama}?`
    )

    if (!konfirmasi) return

    const { error } = await supabase
      .from('anggota')
      .update({ status: statusBaru })
      .eq('id', item.id)

    if (error) {
      alert('Gagal mengubah status anggota')
      return
    }

    getAnggota()
  }

  const filteredAnggota = anggota.filter((item) =>
    item.nama?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Users size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Data Anggota
              </h1>

              <p className="text-sm text-slate-500">
                Kelola data anggota yayasan/koperasi.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Tambah Anggota
          </button>
        </div>
      </section>

      {showForm && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">
              {editId ? 'Edit Anggota' : 'Tambah Anggota'}
            </h2>

            <button
              onClick={resetForm}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={simpanAnggota} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Nama Anggota" value={form.nama} onChange={(value) => setForm({ ...form, nama: value })} />

            <Input label="No HP" value={form.no_hp} onChange={(value) => setForm({ ...form, no_hp: value })} />

            <Input
              label="Tanggal Lahir"
              type="date"
              value={form.tanggal_lahir}
              onChange={(value) => setForm({ ...form, tanggal_lahir: value })}
            />

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Alamat
              </label>

              <textarea
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Alamat anggota"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Catatan
              </label>

              <textarea
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Catatan tambahan"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Save size={18} />
                Simpan
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Daftar Anggota
            </h2>

            <p className="text-sm text-slate-500">
              Total {anggota.length} anggota
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
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4 text-left">No</th>
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">No HP</th>
                <th className="p-4 text-left">Tanggal Lahir</th>
                <th className="p-4 text-left">Alamat</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredAnggota.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-slate-50">
                  <td className="p-4 text-slate-500">{index + 1}</td>

                  <td className="p-4 font-semibold text-slate-800">
                    {item.nama}
                  </td>

                  <td className="p-4">
                    {item.no_hp || '-'}
                  </td>

                  <td className="p-4">
                    {item.tanggal_lahir || '-'}
                  </td>

                  <td className="p-4 max-w-[260px] truncate">
                    {item.alamat || '-'}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editAnggota(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(item)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                          item.status === 'aktif'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Power size={14} />
                        {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAnggota.length === 0 && (
            <div className="py-14 text-center text-sm text-slate-400">
              Data anggota tidak ditemukan.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  )
}