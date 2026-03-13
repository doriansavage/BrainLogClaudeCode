'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings2,
  FileText,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prospects', label: 'Prospects', icon: Users, badge: true },
  { href: '/tarifs', label: 'Tarifs', icon: BarChart3 },
  { href: '/regles', label: 'Règles', icon: Settings2 },
  { href: '/offres', label: 'Offres', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col w-[220px] min-h-screen border-r"
      style={{
        backgroundColor: 'var(--bg-alt)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span
          className="text-base font-bold leading-tight"
          style={{ color: 'var(--dark-navy)' }}
        >
          Brain E-Log
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                active
                  ? 'bg-white text-primary font-semibold shadow-sm'
                  : 'text-charcoal hover:bg-white/60 hover:text-dark-navy'
              )}
              style={
                active
                  ? {
                      color: 'var(--primary)',
                      borderLeft: '3px solid var(--primary)',
                    }
                  : { color: 'var(--charcoal)' }
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto text-xs font-bold rounded-full px-1.5 py-0.5 leading-none"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontSize: '10px',
                  }}
                >
                  5
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="border-t px-3 py-3 flex flex-col gap-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <Link
          href="/parametres"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname?.startsWith('/parametres')
              ? 'bg-white text-primary font-semibold shadow-sm'
              : 'hover:bg-white/60'
          )}
          style={{ color: 'var(--charcoal)' }}
        >
          <Settings size={16} strokeWidth={1.75} />
          <span>Paramètres</span>
        </Link>

        <button
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/60 w-full text-left"
          style={{ color: 'var(--charcoal)' }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--dark-navy)' }}
          >
            M
          </div>
          <span>Mathieu P.</span>
          <ChevronDown size={14} className="ml-auto" />
        </button>
      </div>
    </aside>
  )
}
