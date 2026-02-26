import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBranches, serveBranchUrl } from '../lib/api'

export default function BranchViewer({ githubUrl }) {
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Parse owner/repo from github_url
  const match = githubUrl?.match(/github\.com\/([^/]+)\/([^/]+)/)
  const owner = match?.[1]
  const repo = match?.[2]

  const { data, isLoading, error } = useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: () => getBranches(owner, repo),
    enabled: !!owner && !!repo,
  })

  const defaultBranch = data?.default_branch || 'main'
  const branches = Array.isArray(data?.branches) ? data.branches : []
  const variations = branches.filter(b => b.name !== defaultBranch)

  if (!githubUrl || !owner) {
    return <p className="text-sm text-gray-400 italic">No GitHub repository linked.</p>
  }

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-sm text-gray-400">Loading branches...</p>}

      {error && (
        <p className="text-sm text-red-500">Failed to load branches. The repository may be private.</p>
      )}

      {!isLoading && !error && branches.length > 0 && (
        <>
          {/* Main branch */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Base Version
            </h4>
            <button
              onClick={() => setSelectedBranch(defaultBranch)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                selectedBranch === defaultBranch
                  ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span>{defaultBranch}</span>
                <span className="ml-auto text-xs text-gray-400">default</span>
              </div>
            </button>
          </div>

          {/* Variation branches */}
          {variations.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Variations ({variations.length})
              </h4>
              <div className="space-y-1.5">
                {variations.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setSelectedBranch(b.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selectedBranch === b.name
                        ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 ml-0.5" />
                      <span>{b.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {variations.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              No variations yet. Branches created from {defaultBranch} will appear here.
            </p>
          )}
        </>
      )}

      {/* Preview iframe */}
      {selectedBranch && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b">
            <span className="text-xs text-gray-500">
              Previewing: <span className="font-medium text-gray-700">{owner}/{repo}</span> @ <span className="font-medium text-gray-700">{selectedBranch}</span>
            </span>
            {selectedBranch !== defaultBranch && (
              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                variation
              </span>
            )}
          </div>
          <iframe
            src={serveBranchUrl(owner, repo, selectedBranch)}
            title={`${repo} - ${selectedBranch}`}
            className="w-full border-0"
            style={{ height: '600px' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          />
        </div>
      )}
    </div>
  )
}
