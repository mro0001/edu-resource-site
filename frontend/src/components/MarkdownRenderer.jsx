import ReactMarkdown from 'react-markdown'

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-blue max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
