import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe } from "lucide-react";
import { RESPONSIVE_CLASSES } from "@/config/responsive";
import Logo from "@/components/ui/Logo";

const ResponsiveFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/about" },
        { label: "Notre équipe", href: "/team" },
        { label: "Carrières", href: "/careers" },
        { label: "Presse", href: "/press" },
      ]
    },
    {
      title: "Services",
      links: [
        { label: "Pour les acheteurs", href: "/buyers" },
        { label: "Pour les fournisseurs", href: "/suppliers" },
        { label: "API", href: "/api" },
        { label: "Intégrations", href: "/integrations" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Documentation", href: "/docs" },
        { label: "Contact", href: "/contact" },
        { label: "Statut", href: "/status" },
      ]
    },
    {
      title: "Légal",
      links: [
        { label: "Conditions d'utilisation", href: "/terms" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Cookies", href: "/cookies" },
        { label: "Mentions légales", href: "/legal" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const contactInfo = [
    { icon: Mail, text: "contact@gabonmarkethub.com", href: "mailto:contact@gabonmarkethub.com" },
    { icon: Phone, text: "+241 01 23 45 67", href: "tel:+24101234567" },
    { icon: MapPin, text: "Libreville, Gabon", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className={RESPONSIVE_CLASSES.container}>
        <div className={`${RESPONSIVE_CLASSES.footer.grid} ${RESPONSIVE_CLASSES.footer.container}`}>
          {/* Company info */}
          <div className="space-y-4 sm:space-y-6">
            <Logo size="lg" className="text-white" />
            <p className={`${RESPONSIVE_CLASSES.footer.text} text-gray-300 leading-relaxed`}>
              GabMarketHub est la première plateforme B2B du Gabon, connectant les acheteurs 
              et fournisseurs pour faciliter le commerce local et régional.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <contact.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{contact.text}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className={`${RESPONSIVE_CLASSES.footer.text} text-gray-300 hover:text-white transition-colors`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="border-t border-gray-800 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              Restez informé
            </h3>
            <p className={`${RESPONSIVE_CLASSES.footer.text} text-gray-300 mb-6`}>
              Recevez nos dernières actualités et offres spéciales
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="text-center sm:text-left">
              <p className={`${RESPONSIVE_CLASSES.footer.text} text-gray-400`}>
                © {currentYear} GabMarketHub. Tous droits réservés.
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ResponsiveFooter;
