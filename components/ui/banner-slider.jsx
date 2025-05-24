"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BannerSlider() {
  const [stores, setStores] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === stores.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change de bannière toutes les 5 secondes

      return () => clearInterval(timer);
    }
  }, [stores.length]);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des magasins");
      }
      const data = await response.json();
      // Filtrer les magasins approuvés qui ont une bannière
      const storesWithBanners = data.stores.filter(store => store.isApproved && store.banner);
      setStores(storesWithBanners);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? stores.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === stores.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
        <h2 className="text-white text-2xl font-bold">Bienvenue sur PENVENTORY</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {/* Bannières */}
      <div 
        className="absolute w-full h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {stores.map((store, index) => (
          <div
            key={store.id}
            className="w-full h-full flex-shrink-0"
          >
            <div className="relative w-full h-full">
              <Image
                src={store.banner}
                alt={store.name}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold mb-2">{store.name}</h3>
                {store.description && (
                  <p className="text-white/90">{store.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={store.logo || '/images/placeholder-logo.png'}
                      alt={store.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-white/90">{store.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Boutons de navigation */}
      {stores.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {stores.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 