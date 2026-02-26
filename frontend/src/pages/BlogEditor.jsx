import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createBlogPost, updateBlogPost, getBlogPosts } from '../lib/api'
import { parseTags } from '../lib/utils'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [preview, setPreview] = useState(false)

  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', tags: '', is_published: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load existing post for editing
  const { data: allPosts } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => getBlogPosts(),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && allPosts) {
      const post = allPosts.find(p => p.id === parseInt(id))
      if (post) {
        setForm({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          tags: parseTags(post.tags).join(', '),
          is_published: post.is_published,
        })
      }
    }
  }, [isEdit, id, allPosts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await updateBlogPost(id, payload)
      } else {
        await createBlogPost(payload)
      }
      navigate('/blog')
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
        {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <input
            type="text"
            value={form.excerpt}
            onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
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
            {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
