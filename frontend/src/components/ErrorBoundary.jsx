import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
          <p style={{ color: '#dc2626', fontSize: '18px', marginBottom: '20px' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <details open style={{ whiteSpace: 'pre-wrap', fontSize: '12px', background: '#fef2f2', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Stack Trace</summary>
            {this.state.error?.stack}
            {this.state.errorInfo?.componentStack && (
              <>
                {'\n\nComponent Stack:'}
                {this.state.errorInfo.componentStack}
              </>
            )}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
