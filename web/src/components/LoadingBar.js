'use client';

import React from 'react';
import { useLoading } from '../context/LoadingContext';

export default function LoadingBar() {
  const { isLoading } = useLoading();
  
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div className="h-full bg-blue-500 animate-loading-bar"></div>
    </div>
  );
}

