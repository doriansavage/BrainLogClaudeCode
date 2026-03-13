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
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prospects', label: 'Prospects', icon: Users, badge: '5' },
  { href: '/tarifs', label: 'Tarifs', icon: BarChart3 },
  { href: '/regles', label: 'Règles', icon: Settings2 },
  { href: '/offres', label: 'Offres', icon: FileText },
]

const s = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#fff',
    borderRight: '1px solid var(--border)',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flexShrink: 0,
  },
  logoSection: {
    height: 56,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: '0 20px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'var(--primary)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
}

export function Sidebar() {
  const pathname = usePathname()

  function navItemStyle(active: boolean) {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      marginBottom: 2,
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      color: active ? 'var(--primary)' : 'var(--gray-600)',
      background: active ? 'var(--primary-light)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 150ms',
      cursor: 'pointer',
    } as const
  }

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logoSection}>
        <div style={s.logoIcon}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2h4.5a3.5 3.5 0 0 1 0 7H2V2z" fill="#fff" fillOpacity=".9" />
            <path d="M2 9h5a3 3 0 0 1 0 3H2V9z" fill="#fff" fillOpacity=".6" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em' }}>
          Brain E-Log
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <p style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = !!pathname?.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={navItemStyle(active)}>
              <Icon size={16} strokeWidth={active ? 2 : 1.75} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                  background: active ? 'var(--primary)' : 'var(--gray-100)',
                  color: active ? '#fff' : 'var(--gray-500)',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <Link
          href="/parametres"
          style={{
            ...navItemStyle(!!pathname?.startsWith('/parametres')),
            marginBottom: 4,
          }}
        >
          <Settings size={16} strokeWidth={1.75} style={{ flexShrink: 0, opacity: 0.75 }} />
          <span>Paramètres</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 99, background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            MP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.3 }}>Mathieu P.</p>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.3 }}>Administrateur</p>
          </div>
          <LogOut size={14} style={{ color: 'var(--gray-400)', flexShrink: 0, cursor: 'pointer' }} />
        </div>
      </div>
    </aside>
  )
}
