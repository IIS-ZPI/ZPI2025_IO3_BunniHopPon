import './App.css'
import SessionTrendsPanel from './features/sessionTrends/sessionTrendsPanel.jsx'

function App() {
  return (
    <div className="App">
      <header style={{ padding: '32px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-h)', fontSize: '40px' }}>NBP Analytics</h1>
      </header>
      <main style={{ background: 'var(--bg)', minHeight: '80vh', width: '100%' }}>
        <SessionTrendsPanel />
      </main>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
