'use client';

import { useLoading } from '../context/LoadingContext';

export function useApiCall() {
  const { startLoading, stopLoading } = useLoading();

  const callApi = async (apiFunction, ...args) => {
    startLoading();
    try {
      const result = await apiFunction(...args);
      return result;
    } finally {
      stopLoading();
    }
  };

  return { callApi };
}

