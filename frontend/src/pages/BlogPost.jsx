import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBlogPost } from '../lib/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function BlogPost() {
  const { slug } = useParams()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug),
  })

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-400">Loading...</div>
  if (error) return <div className="max-w-3xl mx-auto px-4 py-12 text-red-500">Post not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/blog" className="text-sm text-brand-600 hover:underline mb-6 block">&larr; Back to Blog</Link>

      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
          <span>{post.author_name}</span>
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          )}
        </div>
        {post.tags?.length > 0 && (
          <div className="flex gap-1.5 mb-8">
            {post.tags.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        <MarkdownRenderer content={post.content} />
      </article>
    </div>
  )
}
