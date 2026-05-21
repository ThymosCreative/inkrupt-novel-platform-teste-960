import { Link, useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AuthModal } from './AuthModal'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Explorar', path: '/explore' },
    { name: 'Escrever', path: '/write' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter text-white hover:text-lime-400 transition-colors"
            >
              INKRUPT.
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-lime-400',
                    location.pathname === link.path ? 'text-lime-400' : 'text-zinc-400',
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full"
            >
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-zinc-400 hover:text-white rounded-full"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full"></span>
                </Button>
                <Link to="/profile">
                  <Avatar className="w-9 h-9 border-2 border-transparent hover:border-lime-400 transition-colors cursor-pointer bg-zinc-800">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`}
                    />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsAuthOpen(true)}
                  className="hover:bg-zinc-900 text-white"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-lime-400 text-black hover:bg-lime-500 font-bold"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  )
}
