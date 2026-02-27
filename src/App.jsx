import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [timeValue, setTimeValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiUrl, setApiUrl] = useState('http://localhost:5000')

  // Load API URL from runtime config
  useEffect(() => {
    // Try to load from window config (injected at runtime)
    if (window.__APP_CONFIG__?.API_URL) {
      setApiUrl(window.__APP_CONFIG__.API_URL)
      return
    }
    
    // Try to fetch config.js file (injected via ConfigMap)
    fetch('/config.js')
      .then(res => res.text())
      .then(configText => {
        // Execute the config script to set window.__APP_CONFIG__
        eval(configText)
        if (window.__APP_CONFIG__?.API_URL) {
          setApiUrl(window.__APP_CONFIG__.API_URL)
        }
      })
      .catch(() => {
        // Fallback to build-time env var or default
        setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000')
      })
  }, [])

  const API_URL = apiUrl

  const callHelloAPI = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    setTimeValue('')

    try {
      const response = await fetch(`${API_URL}/v1/hello`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessage(data.message || 'No message received')
    } catch (err) {
      setError(err.message || 'Failed to call API')
      console.error('Error calling API:', err)
    } finally {
      setLoading(false)
    }
  }

  const callTimeAPI = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    setTimeValue('')

    try {
      const response = await fetch(`${API_URL}/v1/time`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTimeValue(data.utc || 'No time received')
    } catch (err) {
      setError(err.message || 'Failed to call API')
      console.error('Error calling API:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Hello World Frontend</h1>
        <div className="button-row">
          <button
            onClick={callHelloAPI}
            disabled={loading}
            className="hello-button"
          >
            {loading ? 'Calling API...' : 'Call Hello API'}
          </button>

          <button
            onClick={callTimeAPI}
            disabled={loading}
            className="hello-button"
          >
            {loading ? 'Calling API...' : 'Get Time'}
          </button>
        </div>

        {message && (
          <div className="message success">
            <strong>Response:</strong> {message}
          </div>
        )}

        {timeValue && (
          <div className="message success">
            <strong>Time (UTC):</strong> {timeValue}
          </div>
        )}

        {error && (
          <div className="message error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="info">
          <p>API URL: <code>{API_URL}/v1/hello</code></p>
          <p>Time URL: <code>{API_URL}/v1/time</code></p>
        </div>
      </div>
    </div>
  )
}

export default App
