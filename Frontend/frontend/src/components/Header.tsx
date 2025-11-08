import React from 'react';

export default function Header(){
  return (
    <header className="p-4 bg-gray-800 text-white flex items-center justify-between">
      <div className="text-lg font-bold">ProjectApp</div>
      <nav>
        <a href="/" className="px-2">Home</a>
        <a href="/dashboard" className="px-2">Dashboard</a>
      </nav>
    </header>
  );
}
