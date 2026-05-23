import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('Email atau password tidak valid')
    }

    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* BACKGROUND */}
      <img
        src="/bg-yayasan.jpg"
        alt="Background Yayasan"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-blue-950/60" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-2">
        {/* LEFT */}
        <div className="hidden lg:block">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-blue-300">
            ABK UMKM INDONESIA
          </p>

          <h1 className="mt-6 max-w-2xl text-6xl font-black leading-tight text-white">
            Sistem Dompet Keuangan Yayasan
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300">
            Platform digital pengelolaan koperasi, keuangan,
            dan layanan yayasan untuk mendukung pembinaan
            kemandirian anak berkebutuhan khusus.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />

            <p className="font-semibold text-slate-200">
              Sistem aktif dan terintegrasi
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl md:p-10">
            {/* LOGO */}
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="Logo Yayasan"
                className="h-24 w-24 rounded-3xl bg-white p-2 object-contain shadow-lg"
              />
            </div>

            <div className="mt-7 text-center">
              <h2 className="text-4xl font-black text-white">
                Login
              </h2>

              <p className="mt-3 text-slate-300">
                Yayasan Griya Bina Karya ABK
              </p>
            </div>

            {/* ERROR */}
            {errorMsg && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                {errorMsg}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Email
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4">
                  <Mail
                    size={19}
                    className="text-slate-300"
                  />

                  <input
                    type="email"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4">
                  <LockKeyhole
                    size={19}
                    className="text-slate-300"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="text-slate-300 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 py-4 text-lg font-black text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-800 disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Masuk ke Sistem'}

                {!loading && (
                  <ArrowRight
                    size={20}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-400">
                © 2026 Yayasan Griya Bina Karya ABK
              </p>

              <NavLink
                to="/"
                className="mt-3 inline-block text-sm font-bold text-blue-300 transition hover:text-white"
              >
                Kembali ke Beranda
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}