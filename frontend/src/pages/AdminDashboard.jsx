import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getUsers, verifyUser } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const VERIFY_OPTIONS = ['unverified', 'pending', 'verified']
const ROLE_OPTIONS = ['user', 'verified', 'admin']

export default function AdminDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
  })

  const verifyMut = useMutation({
    mutationFn: ({ userId, data }) => verifyUser(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (!user || user.role !== 'admin') {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-red-500">Admin access required.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/submit" className="bg-brand-600 text-white text-sm rounded-md px-4 py-2 hover:bg-brand-700">
            Import Assignment
          </Link>
          <Link to="/admin/blog/new" className="bg-white text-gray-700 text-sm border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50">
            New Blog Post
          </Link>
          <Link to="/admin/instructions/new" className="bg-white text-gray-700 text-sm border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50">
            New Instruction
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>

      {isLoading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Institution</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Verification</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-gray-900">{u.display_name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.institution || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => verifyMut.mutate({
                        userId: u.id,
                        data: { verification_status: u.verification_status, role: e.target.value }
                      })}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.verification_status}
                      onChange={(e) => verifyMut.mutate({
                        userId: u.id,
                        data: { verification_status: e.target.value }
                      })}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      {VERIFY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
