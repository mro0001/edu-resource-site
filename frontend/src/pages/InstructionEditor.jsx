import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createInstruction, updateInstruction, getInstructions } from '../lib/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function InstructionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [preview, setPreview] = useState(false)

  const [form, setForm] = useState({
    title: '', slug: '', content: '', category: 'getting-started', display_order: 0, is_published: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: allPages } = useQuery({
    queryKey: ['instructions-admin'],
    queryFn: () => getInstructions(),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && allPages) {
      const page = allPages.find(p => p.id === parseInt(id))
      if (page) {
        setForm({
          title: page.title,
          slug: page.slug,
          content: page.content,
          category: page.category,
          display_order: page.display_order,
          is_published: page.is_published,
        })
      }
    }
  }, [isEdit, id, allPages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await updateInstruction(id, form)
      } else {
        await createInstruction(form)
      }
      navigate('/instructions')
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(f => ({ ...f, slug }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Instruction Page' : 'New Instruction Page'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              onBlur={() => { if (!form.slug) generateSlug() }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <button type="button" onClick={generateSlug} className="text-xs text-brand-600 hover:underline whitespace-nowrap">
                Auto
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Content (Markdown)</label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-xs text-brand-600 hover:underline"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-white">
              <MarkdownRenderer content={form.content} />
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              rows={15}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-y"
              required
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm(f => ({ ...f, is_published: e.target.checked }))}
            />
            Publish immediately
          </label>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  )
}
