import React from 'react';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <Logo 
              size="lg" 
              className="mb-4 text-white"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              GabMarketHub est la première plateforme B2B du Gabon, 
              connectant les entreprises locales et internationales 
              pour favoriser le commerce et l'innovation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Produits
                </a>
              </li>
              <li>
                <a href="/suppliers" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Fournisseurs
                </a>
              </li>
              <li>
                <a href="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Catégories
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  À propos
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="/supplier/register" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Devenir fournisseur
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Créer un compte
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-300 hover:text-white transition-colors text-sm">
                  API pour développeurs
                </a>
              </li>
              <li>
                <a href="/partnership" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Partenariats
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  Libreville, Gabon
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  +241 XX XX XX XX
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  contact@gabmarkethub.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 GabMarketHub. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Conditions d'utilisation
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;