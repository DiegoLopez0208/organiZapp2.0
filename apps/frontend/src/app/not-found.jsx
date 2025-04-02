import React from 'react';
import Link from 'next/link';

const Custom404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold mb-4 drop-shadow-lg">404</h1>
        <p className="text-2xl mb-6 drop-shadow-md">Oops! La página que buscas no existe.</p>
        <Link href="/" className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold shadow-md hover:bg-gray-200 transition">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
