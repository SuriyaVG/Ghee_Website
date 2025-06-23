import { Link } from 'react-router-dom';

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const productLinks = [
    { label: 'Pure Ghee 250ml', href: '#products' },
    { label: 'Pure Ghee 500ml', href: '#products' },
    { label: 'Pure Ghee 1000ml', href: '#products' },
    { label: 'Bulk Orders', href: '#contact' },
  ];

  const companyLinks = [
    { label: 'About Us', section: 'home' },
    { label: 'Our Heritage', section: 'heritage' },
    { label: 'Quality Promise', section: 'heritage' },
    { label: 'Contact', section: 'contact' },
  ];

  const supportLinks = [
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Return Policy', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];

  return (
    <footer className="bg-deep-brown text-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-playfair font-bold text-stone-700">GSR</h3>
            <p className="text-stone-600 leading-relaxed">
              Bringing you the finest ghee with 50 years of heritage, tradition, and unwavering
              commitment to quality.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="w-10 h-10 bg-stone-600 text-gray-100 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="w-10 h-10 bg-stone-600 text-gray-100 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348 0-1.297 1.051-2.348 2.348-2.348 1.297 0 2.348 1.051 2.348 2.348 0 1.297-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348 0-1.297 1.051-2.348 2.348-2.348 1.297 0 2.348 1.051 2.348 2.348 0 1.297-1.051 2.348-2.348 2.348z" />
                </svg>
              </button>
              <button
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="w-10 h-10 bg-stone-600 text-gray-100 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-playfair font-bold text-stone-700 mb-4">Products</h4>
            <ul className="space-y-2 text-stone-600">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection('products')}
                    className="hover:text-stone-800 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-playfair font-bold text-stone-700 mb-4">Company</h4>
            <ul className="space-y-2 text-stone-600">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.section)}
                    className="hover:text-stone-800 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-playfair font-bold text-stone-700 mb-4">Support</h4>
            <ul className="space-y-2 text-stone-600">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-stone-800 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-400/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-stone-600">&copy; 2024 GSR Ghee. All rights reserved.</p>
          <p className="text-stone-600 mt-2 md:mt-0">Crafted with ❤️ for pure ghee lovers</p>
        </div>
      </div>
    </footer>
  );
}
