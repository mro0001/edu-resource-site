import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBranches, serveBranchUrl } from '../lib/api'

export default function BranchViewer({ githubUrl }) {
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Parse owner/repo from github_url
  const match = githubUrl?.match(/github\.com\/([^/]+)\/([^/]+)/)
  const owner = match?.[1]
  const repo = match?.[2]

  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: () => getBranches(owner, repo),
    enabled: !!owner && !!repo,
  })

  if (!githubUrl || !owner) {
    return <p className="text-sm text-gray-400 italic">No GitHub repository linked.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Branch:</label>
        <select
          value={selectedBranch || ''}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1.5 flex-1"
          disabled={isLoading}
        >
          <option value="">Select a branch...</option>
          {branches.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-500">Failed to load branches. The repository may be private.</p>
      )}

      {selectedBranch && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b">
            Previewing: {owner}/{repo} @ {selectedBranch}
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
