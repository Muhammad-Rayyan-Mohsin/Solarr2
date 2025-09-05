import { Zap, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-solar-gradient rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Sun Survey Spark</span>
            </div>
            <p className="text-secondary-foreground/80 max-w-md mb-6">
              Helping homeowners and businesses discover their solar potential 
              with quick, accurate, and privacy-focused assessments.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-secondary-foreground/20 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-secondary-foreground/20 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-secondary-foreground/20 transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-secondary-foreground/10 rounded-lg hover:bg-secondary-foreground/20 transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#benefits" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/survey" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Start Survey
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-foreground/60 text-sm">
            © 2024 Sun Survey Spark. All rights reserved.
          </p>
          <p className="text-secondary-foreground/60 text-sm mt-2 md:mt-0">
            Made with ❤️ for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;