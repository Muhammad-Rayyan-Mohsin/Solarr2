import { Sun, Twitter, Facebook, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="bg-gray-800 text-white py-12 sm:py-16 pb-20 sm:pb-24"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile Layout - Single Column */}
        <div className="flex flex-col space-y-8 sm:hidden">
          {/* Brand Identity */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Sun Survey Spark</span>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#benefits"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Benefits
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/survey"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Start Survey
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-base">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Sun Survey Spark</span>
            </div>
            <p className="text-white/85 max-w-md mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed font-medium">
              Helping homeowners and businesses discover their solar potential
              with quick, accurate, and privacy-focused assessments.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-500 transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 sm:mb-5 text-base sm:text-lg tracking-tight">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#benefits"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  Benefits
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/survey"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  Start Survey
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 sm:mb-5 text-base sm:text-lg tracking-tight">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm sm:text-base font-medium hover:underline"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 sm:pt-10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <p className="text-white/70 text-sm sm:text-base text-center sm:text-left font-medium">
            © 2024 Sun Survey Spark. All rights reserved.
          </p>
          <p className="text-white/70 text-sm sm:text-base text-center sm:text-right font-medium">
            Made with care for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
