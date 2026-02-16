
import React, { useEffect, useRef } from 'react';
import { RegionData } from '../types';

interface RegionsMapProps {
  regions: RegionData[];
  onSelectRegion: (region: RegionData) => void;
  selectedRegionId?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const RegionsMap: React.FC<RegionsMapProps> = ({ regions, onSelectRegion, selectedRegionId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!window.ymaps || !mapContainerRef.current) return;

    window.ymaps.ready(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

      const map = new window.ymaps.Map(mapContainerRef.current, {
        center: [60, 95], // Центр России
        zoom: 3,
        controls: ['zoomControl', 'fullscreenControl']
      }, {
        searchControlProvider: 'yandex#search'
      });

      mapInstanceRef.current = map;

      regions.forEach((region) => {
        const placemark = new window.ymaps.Placemark(region.coords, {
          hintContent: region.name,
          balloonContent: `<strong>${region.name}</strong><br/>Инвестиции: ${region.investment} млн`
        }, {
          preset: 'islands#blueDotIcon',
          iconColor: selectedRegionId === region.id ? '#16AB16' : '#0052CC'
        });

        placemark.events.add('click', () => {
          onSelectRegion(region);
          map.setCenter(region.coords, 6, { duration: 500 });
        });

        map.geoObjects.add(placemark);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [regions, onSelectRegion, selectedRegionId]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg overflow-hidden border border-atlassian-border dark:border-atlassian-darkBorder shadow-inner"
      style={{ minHeight: '500px' }}
    />
  );
};

export default RegionsMap;
