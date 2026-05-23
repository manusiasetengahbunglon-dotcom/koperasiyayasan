import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import { supabase } from './supabaseClient'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import KasMasuk from './pages/KasMasuk.jsx'
import KasKeluar from './pages/KasKeluar.jsx'
import DataAnggota from './pages/DataAnggota.jsx'
import Simpanan from './pages/Simpanan.jsx'
import Pinjaman from './pages/Pinjaman.jsx'
import Laporan from './pages/Laporan.jsx'
import DashboardAnggota from './pages/DashboardAnggota.jsx'

import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initAuth()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (!session) {
        setProfile(null)
        return
      }

      setTimeout(() => {
        loadProfile(session.user.id)
      }, 0)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function initAuth() {
    try {
      setLoading(true)

      const { data } = await supabase.auth.getSession()
      const currentSession = data.session

      setSession(currentSession)

      if (currentSession) {
        await loadProfile(currentSession.user.id)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.log('INIT AUTH ERROR:', error.message)
      setSession(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.log('PROFILE ERROR:', error.message)
        setProfile(null)
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      console.log('LOAD PROFILE ERROR:', error.message)
      setProfile(null)
      return null
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-6 py-4 shadow">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          session ? (
            profile?.role === 'anggota' ? (
              <Navigate to="/anggota-dashboard" replace />
            ) : (
              <Navigate to="/admin" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin/*"
        element={
          session && profile?.role !== 'anggota' ? (
            <AdminLayout profile={profile} logout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/anggota-dashboard"
        element={
          session && profile?.role === 'anggota' ? (
            <DashboardAnggota profile={profile} logout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AdminLayout({ profile, logout }) {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Navbar profile={profile} logout={logout} />

      <main className="min-w-0 flex-1">
        <header className="hidden h-20 items-center justify-between border-b bg-white px-8 lg:flex">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Dashboard Admin
            </h2>

            <p className="text-sm text-slate-500">
              Sistem Dompet Keuangan Yayasan
            </p>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kas-masuk" element={<KasMasuk />} />
            <Route path="/kas-keluar" element={<KasKeluar />} />
            <Route path="/anggota" element={<DataAnggota />} />
            <Route path="/simpanan" element={<Simpanan />} />
            <Route path="/pinjaman" element={<Pinjaman />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App