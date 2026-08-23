'use client'

import { useActionState } from 'react'
import { startKhatm } from '@/app/actions/khatm'

export function StartKhatmForm() {
  const [error, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        await startKhatm(formData)
        return null
      } catch (err: any) {
        return err.message
      }
    },
    null
  )

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="niyyah_text" className="block text-sm font-medium text-ink mb-1">
          Niyyah (Intention)
        </label>
        <textarea
          name="niyyah_text"
          id="niyyah_text"
          rows={3}
          className="w-full rounded-[var(--radius-control)] border-muted/40 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-transparent"
          placeholder="e.g. For the health and well-being of our parents"
        />
      </div>
      <div>
        <label htmlFor="niyyah_category" className="block text-sm font-medium text-ink mb-1">
          Category (Optional)
        </label>
        <select
          name="niyyah_category"
          id="niyyah_category"
          className="w-full rounded-[var(--radius-control)] border-muted/40 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-transparent"
        >
          <option value="">None</option>
          <option value="Health">Health</option>
          <option value="Deceased">Deceased</option>
          <option value="Guidance">Guidance</option>
          <option value="General">General</option>
        </select>
      </div>

      {error && <p className="text-alert text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isPending ? 'Starting...' : 'Start Khatm'}
      </button>
    </form>
  )
}
