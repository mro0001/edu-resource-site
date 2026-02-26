import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMaterials, addMaterial, deleteMaterial } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const TYPE_LABELS = {
  article: 'Article',
  github_repo: 'GitHub Repo',
  reference: 'Reference',
  video: 'Video',
  other: 'Other',
}

const TYPE_COLORS = {
  article: 'bg-blue-50 text-blue-700',
  github_repo: 'bg-gray-100 text-gray-700',
  reference: 'bg-green-50 text-green-700',
  video: 'bg-purple-50 text-purple-700',
  other: 'bg-yellow-50 text-yellow-700',
}

export default function MaterialsList({ assignmentId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', material_type: 'article', excerpt: '' })

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials', assignmentId],
    queryFn: () => getMaterials(assignmentId),
  })

  const addMut = useMutation({
    mutationFn: (data) => addMaterial(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', assignmentId] })
      setForm({ title: '', url: '', material_type: 'article', excerpt: '' })
      setShowForm(false)
    },
  })

  const delMut = useMutation({
    mutationFn: (id) => deleteMaterial(assignmentId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials', assignmentId] }),
  })

  if (isLoading) return <p className="text-sm text-gray-400">Loading materials...</p>

  return (
    <div className="space-y-3">
      {materials.length === 0 && (
        <p className="text-sm text-gray-400 italic">No supplementary materials yet.</p>
      )}

      {materials.map((m) => (
        <div key={m.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${TYPE_COLORS[m.material_type] || TYPE_COLORS.other}`}>
            {TYPE_LABELS[m.material_type] || m.material_type}
          </span>
          <div className="flex-1 min-w-0">
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {m.title}
            </a>
            {m.excerpt && <p className="text-xs text-gray-500 mt-1">{m.excerpt}</p>}
          </div>
          {isAdmin && (
            <button
              onClick={() => delMut.mutate(m.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {isAdmin && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-brand-600 hover:underline"
        >
          + Add Material
        </button>
      )}

      {isAdmin && showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); addMut.mutate(form) }}
          className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
        >
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
            required
          />
          <input
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
            required
          />
          <select
            value={form.material_type}
            onChange={(e) => setForm(f => ({ ...f, material_type: e.target.value }))}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <textarea
            placeholder="Brief excerpt (optional)"
            value={form.excerpt}
            onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={addMut.isPending} className="bg-brand-600 text-white text-sm rounded px-4 py-1.5 hover:bg-brand-700 disabled:opacity-50">
              {addMut.isPending ? 'Adding...' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
