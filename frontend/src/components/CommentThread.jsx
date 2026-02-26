import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getComments, addComment, deleteComment } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

function Comment({ comment, assignmentId, onReply, currentUserId }) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(assignmentId, comment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', assignmentId] }),
  })

  const canDelete = currentUserId === comment.user_id

  return (
    <div className={`${comment.parent_id ? 'ml-6 border-l-2 border-brand-100 pl-4' : ''}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">
              {comment.user_display_name || 'User'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button onClick={() => onReply(comment)} className="hover:text-brand-600">
              Reply
            </button>
            {canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
                className="hover:text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  )
}

export default function CommentThread({ assignmentId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState(null)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', assignmentId],
    queryFn: () => getComments(assignmentId),
  })

  const addMutation = useMutation({
    mutationFn: (data) => addComment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', assignmentId] })
      setContent('')
      setReplyTo(null)
    },
  })

  const topLevel = comments.filter((c) => !c.parent_id)
  const replies = comments.filter((c) => c.parent_id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    addMutation.mutate({ content, parent_id: replyTo?.id ?? null })
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No comments yet. Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {topLevel.map((c) => (
            <div key={c.id} className="space-y-2">
              <Comment
                comment={c}
                assignmentId={assignmentId}
                onReply={setReplyTo}
                currentUserId={user?.id}
              />
              {replies
                .filter((r) => r.parent_id === c.id)
                .map((r) => (
                  <Comment
                    key={r.id}
                    comment={r}
                    assignmentId={assignmentId}
                    onReply={setReplyTo}
                    currentUserId={user?.id}
                  />
                ))}
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
          {replyTo && (
            <div className="flex items-center justify-between text-xs bg-brand-50 text-brand-700 rounded px-2 py-1">
              <span>Replying to {replyTo.user_display_name}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="font-bold">x</button>
            </div>
          )}
          <textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white resize-none"
            required
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="bg-brand-600 text-white text-sm font-medium rounded px-4 py-1.5 hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {addMutation.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center">
          <a href="/login" className="text-brand-600 hover:underline">Log in</a> to leave a comment.
        </p>
      )}
    </div>
  )
}
