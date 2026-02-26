import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getInstruction, getInstructions } from '../lib/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function InstructionPage() {
  const { slug } = useParams()

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['instruction', slug],
    queryFn: () => getInstruction(slug),
  })

  const { data: allPages = [] } = useQuery({
    queryKey: ['instructions'],
    queryFn: () => getInstructions(),
  })

  // Sidebar nav: pages in the same category
  const sameCategory = allPages.filter(p => p.category === page?.category)

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-12 text-gray-400">Loading...</div>
  if (error) return <div className="max-w-5xl mx-auto px-4 py-12 text-red-500">Page not found.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/instructions" className="text-sm text-brand-600 hover:underline mb-6 block">&larr; All Instructions</Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        {sameCategory.length > 1 && (
          <aside className="lg:col-span-1">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">{page.category}</h3>
            <nav className="space-y-1">
              {sameCategory.map(p => (
                <Link
                  key={p.id}
                  to={`/instructions/${p.slug}`}
                  className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                    p.slug === slug
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Content */}
        <div className={sameCategory.length > 1 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <MarkdownRenderer content={page.content} />
        </div>
      </div>
    </div>
  )
}
