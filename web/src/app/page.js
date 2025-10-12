'use client';

import TocBoard from './components/TocBoard';
import ClientOnly from './components/ClientOnly';

export default function Home() {
  return (
    <div className="app">
      <ClientOnly fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Loading Theory of Change Board...
            </p>
          </div>
        </div>
      }>
        <TocBoard />
      </ClientOnly>
    </div>
  );
}
