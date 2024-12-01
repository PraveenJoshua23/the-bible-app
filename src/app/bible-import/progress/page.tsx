'use client'
import React from 'react';
import ImportProgress from '@/app/components/ImportProgress';

export default function ProgressPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <a 
          href="/bible-import" 
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to Import
        </a>
      </div>
      <ImportProgress />
    </div>
  );
}