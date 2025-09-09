import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle, Users, FileText, Menu } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const navigate = useNavigate();
  
  // Add click handler for debugging
  const handleAboutClick = () => {
    console.log('About button clicked directly');
    const element = document.querySelector('#how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('How it works section not found');
    }
  };

  const navItems = [
    { name: 'Home', url: '#top', icon: Home },
    { name: 'Survey', url: '/survey', icon: FileText },
    { name: 'About', url: '#how-it-works', icon: Users, onClick: handleAboutClick },
    { name: 'FAQ', url: '#faq', icon: HelpCircle },
  ];

  const MobileNavItem = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => {
        if (item.onClick) {
          item.onClick();
        } else if (item.url.startsWith('#')) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/') {
            window.location.href = '/' + item.url;
          } else {
            const element = document.querySelector(item.url);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        } else {
          navigate(item.url);
        }
      }}
      className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted rounded-lg transition-colors"
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.name}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur sm:hidden">
        <div className="container mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-solar-gradient rounded-full flex items-center justify-center">
              <span className="text-lg">☀️</span>
            </div>
            <span className="font-bold text-lg text-foreground">SolarSpark</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="px-4 py-6 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-solar-gradient rounded-full flex items-center justify-center">
                    <span className="text-lg">☀️</span>
                  </div>
                  <SheetTitle className="text-lg font-bold">SolarSpark</SheetTitle>
                </div>
              </SheetHeader>
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item, index) => (
                  <MobileNavItem key={index} item={item} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop logo - positioned as before */}
      <div className="fixed top-6 left-6 z-50 hidden sm:block">
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-lg border border-border rounded-full px-4 py-2 shadow-lg">
          <div className="w-8 h-8 bg-solar-gradient rounded-full flex items-center justify-center">
            <span className="text-lg">☀️</span>
          </div>
          <span className="font-bold text-lg text-foreground">
            SolarSpark
          </span>
        </div>
      </div>

      {/* Navbar - hidden on mobile, shown on desktop */}
      <div className="hidden sm:block">
        <NavBar items={navItems} />
      </div>
    </>
  );
};

export default Navigation;
