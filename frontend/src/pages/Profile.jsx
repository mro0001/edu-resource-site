import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateMe } from '../lib/api'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    institution: user?.institution || '',
    institution_type: user?.institution_type || '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return <div className="max-w-md mx-auto px-4 py-16 text-gray-400">Please log in.</div>

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateMe(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-500 space-y-1">
          <p><span className="font-medium text-gray-700">Email:</span> {user.email}</p>
          <p><span className="font-medium text-gray-700">Role:</span> {user.role}</p>
          <p><span className="font-medium text-gray-700">Verification:</span> {user.verification_status}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={form.display_name}
            onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
          <input
            type="text"
            value={form.institution}
            onChange={(e) => setForm(f => ({ ...f, institution: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
          <select
            value={form.institution_type}
            onChange={(e) => setForm(f => ({ ...f, institution_type: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            <option value="university">University</option>
            <option value="government">Government</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
