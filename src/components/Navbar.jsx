import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Wallet,
  HandCoins,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ profile, logout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const menus = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Kas Masuk',
      path: '/admin/kas-masuk',
      icon: ArrowDownCircle,
    },
    {
      name: 'Kas Keluar',
      path: '/admin/kas-keluar',
      icon: ArrowUpCircle,
    },
    {
      name: 'Data Anggota',
      path: '/admin/anggota',
      icon: Users,
    },
    {
      name: 'Simpanan',
      path: '/admin/simpanan',
      icon: Wallet,
    },
    {
      name: 'Pinjaman',
      path: '/admin/pinjaman',
      icon: HandCoins,
    },
    {
      name: 'Laporan',
      path: '/admin/laporan',
      icon: FileText,
    },
  ]

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between bg-[#0f2d52] text-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-xl bg-white p-1"
          />

          <div>
            <h1 className="font-bold tracking-wide">YAYASAN</h1>

            <p className="text-xs text-blue-200">
              Dompet Keuangan
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-blue-800 transition"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="lg:hidden bg-[#0f2d52] text-white px-4 pb-4 space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600'
                      : 'hover:bg-blue-800 text-blue-100'
                  }`
                }
              >
                <Icon size={18} />
                {menu.name}
              </NavLink>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#0f2d52] text-white min-h-screen flex-col shadow-xl">
        {/* HEADER */}
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-xl bg-white p-1"
          />

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              YAYASAN
            </h1>

            <p className="text-sm text-blue-200">
              Dompet Keuangan
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-5 space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`
                }
              >
                <Icon size={18} />
                {menu.name}
              </NavLink>
            )
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-blue-800">
          <div className="mb-4">
            <p className="font-semibold text-white">
              {profile?.nama || 'Admin Yayasan'}
            </p>

            <p className="text-sm text-blue-200">
              Administrator
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}