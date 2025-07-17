import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Barzinhos</h3>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <span>Desenvolvido por Barzinhos</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

