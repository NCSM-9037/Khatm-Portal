'use client'

import { useState, useTransition } from 'react'
import { deleteFamilyAction } from '@/app/actions/family'

type DeleteFamilyFormProps = {
  familyId: string
  familyName: string
}

export function DeleteFamilyForm({ familyId, familyName }: DeleteFamilyFormProps) {
  const [confirmName, setConfirmName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isMatched = confirmName === familyName

  const handleDelete = () => {
    if (!isMatched) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteFamilyAction(familyId, confirmName)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  return (
    <div className="mt-8 border border-red-500/20 bg-red-50 p-6 rounded-[var(--radius-card)]">
      <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone: Delete Family</h3>
      <p className="text-sm text-red-600/80 mb-4">
        This action will immediately disable this family, removing it from all user views.
        Please type <strong>{familyName}</strong> to confirm.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={familyName}
          className="flex-1 rounded-[var(--radius-control)] border-red-200 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm px-3 py-2 border bg-white text-ink"
          disabled={isPending}
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={!isMatched || isPending}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Deleting...' : 'Delete Family'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
