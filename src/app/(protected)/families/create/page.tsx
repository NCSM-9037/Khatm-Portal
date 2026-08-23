import { createFamilyAction } from '@/app/actions/family'

export default function CreateFamilyPage() {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Create a New Family</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Create a family to start reading Khatms together with your relatives and friends.</p>
          </div>
          <form action={createFamilyAction} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="name" className="sr-only">
                Family Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="The Smiths"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
