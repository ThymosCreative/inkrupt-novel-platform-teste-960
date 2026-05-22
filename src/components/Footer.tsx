import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold mb-4 text-white">Sobre</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Gêneros</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Fantasia
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Romance
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Ação & Aventura
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Mistério
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Para Autores</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/write" className="hover:text-white transition-colors">
                  Centro de Criação
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Guia de Monetização
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Regras de Publicação
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Suporte</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs">
          <p>© 2026 Inkrupt Novel Platform. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="font-black text-sm">INKRUPT.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
