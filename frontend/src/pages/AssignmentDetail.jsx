import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAssignment, serveUrl } from '../lib/api'
import { parseTags } from '../lib/utils'
import CommentThread from '../components/CommentThread'
import MaterialsList from '../components/MaterialsList'
import BranchViewer from '../components/BranchViewer'

const TABS = ['About', 'Materials', 'Branches', 'Comments']

export default function AssignmentDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('About')

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => getAssignment(id),
  })

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-gray-400">Loading...</div>
  if (error) return <div className="max-w-7xl mx-auto px-4 py-12 text-red-500">Assignment not found.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
      {assignment.subject_area && (
        <span className="text-sm bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
          {assignment.subject_area}
        </span>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* iframe */}
        <div className="lg:col-span-2">
          {assignment.file_path ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <iframe
                src={serveUrl(assignment.id)}
                title={assignment.title}
                className="w-full border-0"
                style={{ height: '700px' }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-400">
              No HTML file available for this assignment.
            </div>
          )}
        </div>

        {/* Tabbed panel */}
        <div>
          <div className="flex border-b border-gray-200 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'About' && (
              <div className="space-y-4">
                {assignment.description && (
                  <p className="text-sm text-gray-700">{assignment.description}</p>
                )}
                {parseTags(assignment.tags).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {parseTags(assignment.tags).map(t => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {assignment.github_url && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Source</h4>
                    <a
                      href={assignment.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:underline"
                    >
                      View on GitHub
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Materials' && (
              <MaterialsList assignmentId={parseInt(id)} />
            )}

            {activeTab === 'Branches' && (
              <BranchViewer githubUrl={assignment.github_url} />
            )}

            {activeTab === 'Comments' && (
              <CommentThread assignmentId={parseInt(id)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
