'use client';

export default function About() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">About This App</h1>
        
        <div className="card">
          <h2>🚀 Technology Stack</h2>
          <ul>
            <li><strong>Frontend:</strong> Next.js 14 with React 18</li>
            <li><strong>Backend:</strong> Express.js server</li>
            <li><strong>Architecture:</strong> Server-side rendering with API routes</li>
          </ul>
        </div>

        <div className="card">
          <h2>📋 Features</h2>
          <ul>
            <li>Next.js app served by Express.js backend</li>
            <li>API endpoints for backend communication</li>
            <li>Health monitoring</li>
            <li>Responsive design</li>
          </ul>
        </div>

        <a href="/" className="back-link">
          ← Back to Home
        </a>
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
          color: white;
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          margin: 0 0 3rem 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
        }

        .card {
          margin: 1rem;
          padding: 2rem;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          max-width: 500px;
          width: 100%;
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .card li {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .back-link {
          margin-top: 2rem;
          padding: 1rem 2rem;
          color: white;
          text-decoration: none;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 5px;
          background: rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }

        .back-link:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}