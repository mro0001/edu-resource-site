import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getInstructions } from '../lib/api'

export default function InstructionsList() {
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['instructions'],
    queryFn: () => getInstructions(),
  })

  // Group by category
  const grouped = pages.reduce((acc, page) => {
    const cat = page.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(page)
    return acc
  }, {})

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">GitHub Guide</h1>
      <p className="text-gray-500 mb-8">Step-by-step instructions for working with GitHub, designed for non-technical users.</p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 italic">No instruction pages yet.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-800 capitalize mb-3 border-b border-gray-100 pb-2">
                {category}
              </h2>
              <div className="space-y-2">
                {items.map((page) => (
                  <Link
                    key={page.id}
                    to={`/instructions/${page.slug}`}
                    className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-brand-200 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-medium text-gray-900">{page.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
