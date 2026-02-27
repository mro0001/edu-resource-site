import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMaterials, addMaterial, uploadMaterial, deleteMaterial, materialDownloadUrl } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const TYPE_LABELS = {
  article: 'Article',
  github_repo: 'GitHub Repo',
  reference: 'Reference',
  video: 'Video',
  document: 'Document',
  other: 'Other',
}

const TYPE_COLORS = {
  article: 'bg-blue-50 text-blue-700',
  github_repo: 'bg-gray-100 text-gray-700',
  reference: 'bg-green-50 text-green-700',
  video: 'bg-purple-50 text-purple-700',
  document: 'bg-amber-50 text-amber-700',
  other: 'bg-yellow-50 text-yellow-700',
}

export default function MaterialsList({ assignmentId, assignmentOwnerId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canManage = user && (user.id === assignmentOwnerId || user.role === 'admin')

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('link') // 'link' or 'upload'
  const [form, setForm] = useState({ title: '', url: '', material_type: 'article', excerpt: '' })
  const [file, setFile] = useState(null)
  const [uploadError, setUploadError] = useState('')

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials', assignmentId],
    queryFn: () => getMaterials(assignmentId),
  })

  const addMut = useMutation({
    mutationFn: (data) => addMaterial(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', assignmentId] })
      resetForm()
    },
    onError: (err) => setUploadError(err.response?.data?.detail || 'Failed to add material'),
  })

  const uploadMut = useMutation({
    mutationFn: (formData) => uploadMaterial(assignmentId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', assignmentId] })
      resetForm()
    },
    onError: (err) => setUploadError(err.response?.data?.detail || 'Upload failed'),
  })

  const delMut = useMutation({
    mutationFn: (id) => deleteMaterial(assignmentId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials', assignmentId] }),
  })

  const resetForm = () => {
    setForm({ title: '', url: '', material_type: 'article', excerpt: '' })
    setFile(null)
    setShowForm(false)
    setUploadError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUploadError('')

    if (formMode === 'upload') {
      if (!file) { setUploadError('Please select a file'); return }
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', form.title)
      formData.append('material_type', form.material_type)
      if (form.excerpt) formData.append('excerpt', form.excerpt)
      uploadMut.mutate(formData)
    } else {
      if (!form.url) { setUploadError('Please enter a URL'); return }
      addMut.mutate(form)
    }
  }

  const isPending = addMut.isPending || uploadMut.isPending

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
            {m.file_path ? (
              <a
                href={materialDownloadUrl(assignmentId, m.id)}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                {m.title}
                {m.original_filename && (
                  <span className="text-xs text-gray-400 ml-1">({m.original_filename})</span>
                )}
              </a>
            ) : m.url ? (
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                {m.title}
              </a>
            ) : (
              <span className="text-sm font-medium text-gray-700">{m.title}</span>
            )}
            {m.excerpt && <p className="text-xs text-gray-500 mt-1">{m.excerpt}</p>}
          </div>
          {canManage && (
            <button
              onClick={() => delMut.mutate(m.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {canManage && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-brand-600 hover:underline"
        >
          + Add Material
        </button>
      )}

      {canManage && showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50"
        >
          {/* Mode toggle */}
          <div className="flex gap-1 bg-gray-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setFormMode('link')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                formMode === 'link' ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-600'
              }`}
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setFormMode('upload')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                formMode === 'upload' ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-600'
              }`}
            >
              Upload File
            </button>
          </div>

          {uploadError && (
            <div className="bg-red-50 text-red-700 text-xs rounded-lg p-2">{uploadError}</div>
          )}

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
            required
          />

          {formMode === 'link' ? (
            <input
              placeholder="URL"
              type="url"
              value={form.url}
              onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
            />
          ) : (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-brand-50 file:text-brand-700"
            />
          )}

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
            placeholder="Brief description (optional)"
            value={form.excerpt}
            onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="bg-brand-600 text-white text-sm rounded px-4 py-1.5 hover:bg-brand-700 disabled:opacity-50">
              {isPending ? (formMode === 'upload' ? 'Uploading...' : 'Adding...') : (formMode === 'upload' ? 'Upload' : 'Add')}
            </button>
            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
