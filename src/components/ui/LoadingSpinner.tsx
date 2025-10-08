import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "로딩 중..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;