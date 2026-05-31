import './App.css'
import SessionTrendsPanel from './features/sessionTrends/sessionTrendsPanel.jsx'

function App() {
  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0 }}>NBP Analytics</h1>
      </header>
      <main id="center">
        <SessionTrendsPanel />
      </main>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
