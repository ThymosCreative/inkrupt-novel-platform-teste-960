import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export default function Layout() {
  const location = useLocation()
  const isReader = location.pathname.includes('/chapter/')

  if (isReader) {
    return (
      <main className="min-h-screen bg-black">
        <Outlet />
      </main>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
