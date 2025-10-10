'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Use localhost:8080 for development, relative paths for production
    const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '';
    
    // Fetch data from Express.js backend
    fetch(`${apiBase}/api/hello`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Error loading message'));

    fetch(`${apiBase}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Welcome to <span className="highlight">Next.js + Express.js!</span>
        </h1>

        <p className="description">
          A simple web app built with Next.js and served by Express.js
        </p>

        <div className="card">
          <h2>Backend Message:</h2>
          <p>{message}</p>
        </div>

        {health && (
          <div className="card">
            <h2>Server Status:</h2>
            <p>Status: {health.status}</p>
            <p>Service: {health.service}</p>
            <p>Uptime: {Math.floor(health.uptime)} seconds</p>
          </div>
        )}

        <div className="grid">
          <a href="/about" className="card">
            <h2>About Page &rarr;</h2>
            <p>Learn more about this application</p>
          </a>

          <a
            href="https://nextjs.org/docs"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>Next.js Docs &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .highlight {
          color: #ffd700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          text-align: center;
          margin: 2rem 0;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          transition: transform 0.15s ease, border-color 0.15s ease;
          max-width: 300px;
        }

        .card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.6);
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 3rem;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }

          .title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}