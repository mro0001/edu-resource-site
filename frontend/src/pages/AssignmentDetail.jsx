import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAssignment, updateAssignment, serveUrl } from '../lib/api'
import { parseTags } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import CommentThread from '../components/CommentThread'
import MaterialsList from '../components/MaterialsList'
import BranchViewer from '../components/BranchViewer'

const TABS = ['About', 'Materials', 'Branches', 'Comments']

export default function AssignmentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('About')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editError, setEditError] = useState('')

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => getAssignment(id),
  })

  const editMut = useMutation({
    mutationFn: (data) => updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', id] })
      setEditing(false)
      setEditError('')
    },
    onError: (err) => {
      setEditError(err.response?.data?.detail || 'Update failed')
    },
  })

  const canEdit = user && assignment && (
    assignment.created_by_id === user.id || user.role === 'admin'
  )

  const startEditing = () => {
    setEditForm({
      title: assignment.title,
      description: assignment.description || '',
      subject_area: assignment.subject_area || '',
      tags: parseTags(assignment.tags).join(', '),
    })
    setEditError('')
    setEditing(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    editMut.mutate({
      title: editForm.title,
      description: editForm.description || null,
      subject_area: editForm.subject_area || null,
      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
  }

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-gray-400">Loading...</div>
  if (error) return <div className="max-w-7xl mx-auto px-4 py-12 text-red-500">Assignment not found.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
        {canEdit && !editing && (
          <button
            onClick={startEditing}
            className="text-sm text-brand-600 hover:text-brand-700 px-3 py-1 border border-brand-200 rounded-md hover:bg-brand-50 transition-colors flex-shrink-0"
          >
            Edit
          </button>
        )}
      </div>
      {assignment.subject_area && !editing && (
        <span className="text-sm bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
          {assignment.subject_area}
        </span>
      )}

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          {editError && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{editError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Area</label>
            <input
              type="text"
              value={editForm.subject_area}
              onChange={(e) => setEditForm(f => ({ ...f, subject_area: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={editMut.isPending}
              className="bg-brand-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
            >
              {editMut.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
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
              <MaterialsList assignmentId={parseInt(id)} assignmentOwnerId={assignment.created_by_id} />
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
