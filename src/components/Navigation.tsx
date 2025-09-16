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
      {/* Logo in top left */}
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-lg border border-border rounded-full px-4 py-2 shadow-lg">
          <div className="w-8 h-8 bg-solar-gradient rounded-full flex items-center justify-center">
            <span className="text-lg">☀️</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:block">
            SolarSpark
          </span>
        </div>
      </div>

      {/* Modern Tubelight Navbar */}
      <NavBar items={navItems} />
    </>
  );
};

export default Navigation;
