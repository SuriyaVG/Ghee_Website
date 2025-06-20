import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

export function Heritage() {
  const timelineItems = [
    {
      year: '1974',
      title: 'The Beginning',
      description:
        'Founded by our grandfather with a simple vision: to create the purest ghee using traditional methods passed down through generations.',
      bgColor: 'bg-warm-gold',
    },
    {
      year: '1990',
      title: 'Expansion',
      description:
        'Second generation took over, expanding our reach while maintaining the same quality and traditional methods that made us trusted.',
      bgColor: 'bg-rich-brown',
    },
    {
      year: '2010',
      title: 'Innovation',
      description:
        'Introduced modern packaging while preserving traditional preparation methods, making our ghee accessible to more families.',
      bgColor: 'bg-butter-yellow',
    },
    {
      year: '2024',
      title: 'Digital Era',
      description:
        'Today, we continue our legacy with the third generation, bringing our heritage ghee to your doorstep with the same love and care.',
      bgColor: 'bg-warm-gold',
    },
  ];

  const familyValues = [
    {
      image: '/images/ghee-250ml.webp',
      title: 'Family Values',
      description: 'Every jar is made with the love and care of a family recipe',
    },
    {
      image: '/images/ghee-500ml.webp',
      title: 'Traditional Methods',
      description: 'Time-honored techniques ensure authentic taste and quality',
    },
    {
      image: '/images/ghee-1000ml.webp',
      title: 'Quality Promise',
      description: '50 years of trust built on consistent quality and purity',
    },
  ];

  return (
    <section id="heritage" className="py-20 bg-cream-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-deep-brown mb-4">
            Five Decades of Heritage
          </h2>
          <p className="text-xl text-deep-brown/70 max-w-3xl mx-auto">
            From a small family kitchen to a trusted name in pure ghee, discover the journey that
            spans three generations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            {/* Timeline */}
            <div className="space-y-8">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
                  >
                    <span className="text-white font-bold text-sm">{item.year}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-bold text-deep-brown mb-2">
                      {item.title}
                    </h3>
                    <p className="text-deep-brown/70">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <Image
              src="/images/hero-background.webp"
              alt="Traditional heritage cooking setup"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/50 to-transparent rounded-2xl"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-playfair font-bold mb-2">Three Generations</h3>
              <p className="text-white/90">Of dedication to pure, authentic ghee</p>
            </div>
          </div>
        </div>

        {/* Family Values Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {familyValues.map((value, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Image
                  src={value.image}
                  alt={value.title}
                  className="w-full h-48 object-cover rounded-xl"
                  loading="lazy"
                />
                <h3 className="text-xl font-playfair font-bold text-deep-brown">{value.title}</h3>
                <p className="text-deep-brown/70">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
