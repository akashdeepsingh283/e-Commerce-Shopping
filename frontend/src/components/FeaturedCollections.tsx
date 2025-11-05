import { ChevronRight } from "lucide-react";

const collections = [
  { title: "BRACELETS", 
    category: "bracelets", 
    image: "/collection/Bracelet.jpg" },

  { title: "PEARL MALAS", 
    category: "pearl malas", 
    image: "/public/n1.jpg" },

  { title: "RINGS", 
    category: "rings", 
    image: "/collection/Ring.jpg" },

  { title: "NECKLACES", 
    category: "necklaces", 
    image: "/collection/1.jpg" },

  { title: "EARRINGS", 
    category: "earrings", 
    image: "/collection/Earring.jpg" },
    
  { title: "PEARLS BRACELETS", 
    category: "pearls bracelets", 
    image: "/Bracelets/b2.jpg" },
];

interface FeaturedCollectionsProps {
  onCollectionClick?: (category: string) => void;
}

export default function FeaturedCollections({ onCollectionClick }: FeaturedCollectionsProps) {
  const handleCollectionClick = (category: string) => {
    if (onCollectionClick) {
      onCollectionClick(category);
    }
  };

  return (
    <section id="collections" className="min-h-screen bg-black text-white py-20 px-6 lg:px-16">
      <div className="relative overflow-hidden mb-10">
  <div className="animate-scroll-rtl whitespace-nowrap py-2 text-lg  tracking-wider font-light text-white">
    ⭐ EVERY PEARL COMES WITH GUARANTEE CERTIFICATE 
    &nbsp;&nbsp;&nbsp; ⭐ FREE DELIVERY ALL OVER INDIA 
    &nbsp;&nbsp;&nbsp; ⭐ STAY STYLISH WITH OUR NEWEST COLLECTION.
  </div>
</div>


      <center>
        <h1 className="text-2xl lg:text-5xl font-light tracking-wide mb-10">
          EXPLORE A UNIVERSE OF LUXURIOUS PEARLS
        </h1>
      </center>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 place-items-center">
        {collections.map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer w-full max-w-xs"
            onClick={() => handleCollectionClick(item.category)}
          >
            <div className="relative overflow-hidden aspect-square rounded-lg">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex items-center justify-between mt-3 border-t border-white/40 pt-3">
              <h2 className="text-base tracking-wide font-light">{item.title}</h2>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}