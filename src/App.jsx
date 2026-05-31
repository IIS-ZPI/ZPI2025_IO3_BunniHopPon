import { useState } from 'react'
import './App.css'
import SessionTrendsPanel from './features/sessionTrends/sessionTrendsPanel'

function App() {
  return (
    <main>
      <h1>NBP Analytics</h1>
      <SessionTrendsPanel />
    </main>
  )
}

export default App
