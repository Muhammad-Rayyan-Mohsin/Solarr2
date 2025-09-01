import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-0 duration-1000">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Build Something
              <br />
              <span className="text-primary">Amazing</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your blank canvas awaits. Start creating the next big thing with our powerful platform and intuitive tools.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                variant="hero" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Get Started
              </Button>
              <Button 
                variant="glow" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </section>
      
      {/* Feature Cards Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card/80 backdrop-blur-sm p-8 rounded-lg shadow-elegant border border-border/50 hover:shadow-glow transition-smooth hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const features = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Built for speed and performance with modern technologies that scale with your needs."
  },
  {
    icon: "🎨",
    title: "Beautiful Design",
    description: "Stunning user interfaces that engage your audience and create memorable experiences."
  },
  {
    icon: "🚀",
    title: "Ready to Launch",
    description: "Everything you need to go from idea to production in record time with confidence."
  }
];

export default Index;