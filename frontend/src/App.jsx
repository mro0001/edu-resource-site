import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import AssignmentDetail from './pages/AssignmentDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import InstructionsList from './pages/InstructionsList'
import InstructionPage from './pages/InstructionPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminSubmit from './pages/AdminSubmit'
import BlogEditor from './pages/BlogEditor'
import InstructionEditor from './pages/InstructionEditor'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="assignments/:id" element={<AssignmentDetail />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="instructions" element={<InstructionsList />} />
              <Route path="instructions/:slug" element={<InstructionPage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/submit" element={<AdminSubmit />} />
              <Route path="admin/blog/new" element={<BlogEditor />} />
              <Route path="admin/blog/:id/edit" element={<BlogEditor />} />
              <Route path="admin/instructions/new" element={<InstructionEditor />} />
              <Route path="admin/instructions/:id/edit" element={<InstructionEditor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
