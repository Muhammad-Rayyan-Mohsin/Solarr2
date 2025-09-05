import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'Austin, TX',
    quote: 'The assessment was incredibly detailed and helped me understand exactly what solar could do for my home. Saved me thousands!',
    rating: 5
  },
  {
    name: 'Mike Chen',
    location: 'Phoenix, AZ',
    quote: 'Quick, easy, and no pressure. Got exactly the information I needed to make an informed decision about solar.',
    rating: 5
  },
  {
    name: 'Lisa Rodriguez',
    location: 'San Diego, CA',
    quote: 'The personalized report showed me incentives I didn\'t even know existed. Highly recommend this service!',
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4 text-foreground">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Real feedback from homeowners who discovered their solar potential
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="card-hover border-0 bg-card/80 backdrop-blur-sm scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-solar-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;