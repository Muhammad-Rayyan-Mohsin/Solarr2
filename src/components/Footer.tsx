const Footer = () => {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-solar-gradient rounded-full" />
          <span className="font-semibold">SolarSpark</span>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-6">
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQ</a>
          <a href="/submissions">Submissions</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
