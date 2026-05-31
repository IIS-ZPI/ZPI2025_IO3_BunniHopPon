import './App.css'
import SessionTrendsPanel from './features/sessionTrends/sessionTrendsPanel.jsx'
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fff' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <header style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <h1 style={{ margin: 0, color: 'var(--text-h)' }}>NBP Analytics</h1>
        </header>
        <main id="center" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
          <SessionTrendsPanel />
        </main>
        <div className="ticks"></div>
        <section id="spacer"></section>
      </div>
    </ErrorBoundary>
  )
}

export default App
