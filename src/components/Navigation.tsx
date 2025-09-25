import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Zap,
  Home,
  HelpCircle,
  Users,
  FileText,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/ui/tubelight-navbar";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Survey", url: "/survey", icon: FileText },
    { name: "About", url: "#how-it-works", icon: Users },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  return (
    <>
      {/* Logo in top left - Mobile optimized */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-lg border border-border rounded-full px-3 py-2 sm:px-4 sm:py-2 shadow-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-solar-gradient rounded-full flex items-center justify-center">
            <span className="text-sm sm:text-lg">☀️</span>
          </div>
          <span className="font-bold text-base sm:text-lg text-foreground hidden sm:block">
            SolarSpark
          </span>
        </div>
      </div>

      {/* Modern Tubelight Navbar - Mobile optimized */}
      <NavBar items={navItems} />
    </>
  );
};

export default Navigation;
