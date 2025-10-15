'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import LoadingBar from './components/LoadingBar';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <AuthProvider>
          <LoadingBar />
          {children}
        </AuthProvider>
      </LoadingProvider>
    </Provider>
  );
}

