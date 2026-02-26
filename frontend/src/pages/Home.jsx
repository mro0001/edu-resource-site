import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAssignments } from '../lib/api'

export default function Home() {
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => getAssignments(),
  })

  const subjects = [...new Set(assignments.map(a => a.subject_area).filter(Boolean))]

  const filtered = assignments.filter((a) => {
    if (subjectFilter && a.subject_area !== subjectFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Educational Resources</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            Browse interactive assignments, supplementary materials, and GitHub-hosted educational content.
          </p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-center py-12">Loading assignments...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No assignments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <Link
                key={a.id}
                to={`/assignments/${a.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                {a.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {a.subject_area && (
                    <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {a.subject_area}
                    </span>
                  )}
                  {a.tags?.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
