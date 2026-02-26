/**
 * API client — all requests go to /api (proxied to FastAPI by Vite).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Ensure list endpoints always return arrays, even if the API returns unexpected data
function ensureArray(data) {
  return Array.isArray(data) ? data : []
}

// Inject auth token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ─────────────────────────────────────────────────────────────────────

export const register = (data) =>
  api.post('/auth/register', data).then(r => r.data)

export const login = (data) =>
  api.post('/auth/login', new URLSearchParams({
    username: data.email,
    password: data.password,
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)

export const updateMe = (data) =>
  api.patch('/auth/me', data).then(r => r.data)

// ── Assignments ──────────────────────────────────────────────────────────────

export const getAssignments = (params = {}) =>
  api.get('/assignments', { params }).then(r => ensureArray(r.data))

export const getAssignment = (id) =>
  api.get(`/assignments/${id}`).then(r => r.data)

export const importFromGitHub = (data) =>
  api.post('/assignments/import', data).then(r => r.data)

export const updateAssignment = (id, data) =>
  api.patch(`/assignments/${id}`, data).then(r => r.data)

export const deleteAssignment = (id) =>
  api.delete(`/assignments/${id}`).then(r => r.data)

export const serveUrl = (id) => `/api/assignments/${id}/serve`

// ── Materials ────────────────────────────────────────────────────────────────

export const getMaterials = (assignmentId) =>
  api.get(`/assignments/${assignmentId}/materials`).then(r => ensureArray(r.data))

export const addMaterial = (assignmentId, data) =>
  api.post(`/assignments/${assignmentId}/materials`, data).then(r => r.data)

export const deleteMaterial = (assignmentId, materialId) =>
  api.delete(`/assignments/${assignmentId}/materials/${materialId}`).then(r => r.data)

// ── Comments ─────────────────────────────────────────────────────────────────

export const getComments = (assignmentId) =>
  api.get(`/assignments/${assignmentId}/comments`).then(r => ensureArray(r.data))

export const addComment = (assignmentId, data) =>
  api.post(`/assignments/${assignmentId}/comments`, data).then(r => r.data)

export const deleteComment = (assignmentId, commentId) =>
  api.delete(`/assignments/${assignmentId}/comments/${commentId}`).then(r => r.data)

// ── GitHub Browser ───────────────────────────────────────────────────────────

export const getBranches = (owner, repo) =>
  api.get('/github/branches', { params: { owner, repo } }).then(r => ensureArray(r.data))

export const serveBranchUrl = (owner, repo, branch) =>
  `/api/github/serve?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`

// ── Blog ─────────────────────────────────────────────────────────────────────

export const getBlogPosts = (params = {}) =>
  api.get('/blog', { params }).then(r => ensureArray(r.data))

export const getBlogPost = (slug) =>
  api.get(`/blog/${slug}`).then(r => r.data)

export const createBlogPost = (data) =>
  api.post('/blog', data).then(r => r.data)

export const updateBlogPost = (id, data) =>
  api.patch(`/blog/${id}`, data).then(r => r.data)

export const deleteBlogPost = (id) =>
  api.delete(`/blog/${id}`).then(r => r.data)

// ── Instructions ─────────────────────────────────────────────────────────────

export const getInstructions = (params = {}) =>
  api.get('/instructions', { params }).then(r => ensureArray(r.data))

export const getInstruction = (slug) =>
  api.get(`/instructions/${slug}`).then(r => r.data)

export const createInstruction = (data) =>
  api.post('/instructions', data).then(r => r.data)

export const updateInstruction = (id, data) =>
  api.patch(`/instructions/${id}`, data).then(r => r.data)

export const deleteInstruction = (id) =>
  api.delete(`/instructions/${id}`).then(r => r.data)

// ── Admin ────────────────────────────────────────────────────────────────────

export const getUsers = () =>
  api.get('/admin/users').then(r => ensureArray(r.data))

export const verifyUser = (userId, data) =>
  api.patch(`/admin/users/${userId}/verify`, data).then(r => r.data)

export default api
