'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function HistoryFilters({ currentSearch, currentDateRange }: { currentSearch: string, currentDateRange: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(currentSearch)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    
    startTransition(() => {
      router.replace(`?${params.toString()}`)
    })
  }, [debouncedSearch, router, searchParams])

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('dateRange', value)
    } else {
      params.delete('dateRange')
    }
    
    startTransition(() => {
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <input
        type="text"
        placeholder="Search Niyyah..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border border-muted/20 rounded-[var(--radius-control)] bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
      />
      <select
        value={currentDateRange}
        onChange={handleDateChange}
        className="px-3 py-2 border border-muted/20 rounded-[var(--radius-control)] bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48"
      >
        <option value="">All Time</option>
        <option value="last_30_days">Last 30 Days</option>
        <option value="last_year">Last 12 Months</option>
      </select>
    </div>
  )
}
