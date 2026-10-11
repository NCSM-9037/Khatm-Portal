'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { nexaFont } from '@/app/fonts'

export function PortalDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-control)] bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-[11px] sm:text-xs tracking-wide border border-accent/20 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40 whitespace-nowrap shrink-0"
        aria-expanded={isOpen}
      >
        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
        <span className="whitespace-nowrap">Khatm Portal</span>
        <ChevronDown className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent/80 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 origin-top-left sm:origin-top-right rounded-[var(--radius-card)] bg-surface border border-muted/20 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 bg-primary/5 border-b border-muted/15">
            <p className={`${nexaFont.className} text-xs font-bold text-primary tracking-wide`}>
              DAR EL HASAINARIYYA
            </p>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-0.5">
              Available Portals
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-start gap-2.5 p-2 rounded-[var(--radius-control)] bg-primary/10 text-primary transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-primary text-surface mt-0.5">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-ink">Khatm Portal</span>
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                </div>
                <p className="text-[11px] text-muted truncate">Qur'an Khatm Tracker</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
