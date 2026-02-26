import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getBlogPosts } from '../lib/api'
import { parseTags } from '../lib/utils'

export default function BlogList() {
  const [tagFilter, setTagFilter] = useState('')

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => getBlogPosts(),
  })

  const allTags = [...new Set(posts.flatMap(p => parseTags(p.tags)))]
  const filtered = tagFilter ? posts.filter(p => parseTags(p.tags).includes(tagFilter)) : posts

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setTagFilter('')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !tagFilter ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-200'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                tagFilter === tag ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 italic">No blog posts yet.</p>
      ) : (
        <div className="space-y-8">
          {filtered.map((post) => (
            <article key={post.id} className="border-b border-gray-100 pb-8">
              <Link to={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span>{post.author_name}</span>
                {post.published_at && (
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                )}
              </div>
              {post.excerpt && <p className="text-sm text-gray-600">{post.excerpt}</p>}
              {parseTags(post.tags).length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {parseTags(post.tags).map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
