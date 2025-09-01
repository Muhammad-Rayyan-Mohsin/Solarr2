import solarHeroImage from "@/assets/solar-hero.jpg";

export function Hero() {
  return (
    <section className="relative h-64 md:h-80 overflow-hidden rounded-xl mb-8">
      <div className="absolute inset-0">
        <img
          src={solarHeroImage}
          alt="Professional survey interface"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>
      
      <div className="relative h-full flex flex-col justify-center px-8 text-white">
        <div className="max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            ⚡ Professional Survey
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Professional assessment for your renewable energy journey
          </p>
                      <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></span>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}