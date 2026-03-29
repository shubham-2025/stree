import HeroCarousel from "@/components/HeroCarousel";
import { getHomeLatestProducts } from "@/lib/data/home";
import { formatPrice } from "@/lib/utils";

export default async function HomeCarouselCell() {
  const newArrivals = await getHomeLatestProducts();
  const slideSources = newArrivals.filter(
    (p) => p.images && p.images.length > 0
  );
  const heroSlides =
    slideSources.length >= 3
      ? [
          {
            image: slideSources[0].images[0],
            title: slideSources[0].title,
            subtitle: `Starting at ${formatPrice(slideSources[0].price)}`,
          },
          {
            image: slideSources[1].images[0],
            title: slideSources[1].title,
            subtitle: `Starting at ${formatPrice(slideSources[1].price)}`,
          },
          {
            image: slideSources[2].images[0],
            title: slideSources[2].title,
            subtitle: `Starting at ${formatPrice(slideSources[2].price)}`,
          },
        ]
      : slideSources.map((p) => ({
          image: p.images[0],
          title: p.title,
          subtitle: `Starting at ${formatPrice(p.price)}`,
        }));

  if (heroSlides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/50">
        <div className="text-center">
          <span className="mb-3 block text-4xl sm:mb-4 sm:text-6xl">🧵</span>
          <p className="text-sm font-semibold text-brand sm:text-base">
            Beautiful sarees coming soon
          </p>
        </div>
      </div>
    );
  }

  return <HeroCarousel slides={heroSlides} />;
}
