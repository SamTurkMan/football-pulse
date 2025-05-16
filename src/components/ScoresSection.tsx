import React, { useState, useEffect, useRef } from 'react';
import { fetchFootballScores } from '../services/scoresService';
import ScoreCard from './ScoreCard';
import ScoreCardSkeleton from './ScoreCardSkeleton';
import { Match } from '../types/Match';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScoresSectionProps {
  darkMode: boolean;
}

const ScoresSection: React.FC<ScoresSectionProps> = ({ darkMode }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const loadAllScores = async () => {
      try {
        setLoading(true);
        const [liveMatches, todayMatches, upcomingMatches] = await Promise.all([
          fetchFootballScores('live'),
          fetchFootballScores('today'),
          fetchFootballScores('upcoming')
        ]);

        // Combine and sort matches
        const allMatches = [
          ...liveMatches,
          ...todayMatches.filter(match => match.status.toLowerCase() !== 'live'),
          ...upcomingMatches
        ].sort((a, b) => {
          // Live matches first
          if (a.status.toLowerCase() === 'live' && b.status.toLowerCase() !== 'live') return -1;
          if (b.status.toLowerCase() === 'live' && a.status.toLowerCase() !== 'live') return 1;
          
          // Then by time
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeA - timeB;
        });

        setMatches(allMatches);
      } catch (error) {
        console.error('Failed to fetch football scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllScores();
    const interval = setInterval(loadAllScores, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      
      const checkOverflow = () => {
        if (container) {
          const hasOverflow = container.scrollWidth > container.clientWidth;
          setShowRightArrow(hasOverflow);
        }
      };
      
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkOverflow);
      };
    }
  }, [matches]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 200 : 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full bg-primary dark:bg-primary-dark shadow-md relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold mb-1">
              Futbol Maçları
            </h2>
            <p className="text-accent-light text-sm">
              Canlı, bugünkü ve yaklaşan maçlar
            </p>
          </div>
          {matches.some(m => m.status.toLowerCase() === 'live') && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-accent-light text-sm">Canlı maçlar oynanıyor</span>
            </div>
          )}
        </div>

        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/90 dark:bg-primary-dark/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/90 dark:bg-primary-dark/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-2 hide-scrollbar relative scroll-smooth"
          >
            <div className="flex space-x-3 sm:space-x-4 min-w-max px-6 sm:px-8">
              {loading ? (
                <>
                  <ScoreCardSkeleton darkMode={darkMode} />
                  <ScoreCardSkeleton darkMode={darkMode} />
                  <ScoreCardSkeleton darkMode={darkMode} />
                </>
              ) : matches.length > 0 ? (
                matches.map(match => (
                  <ScoreCard key={match.id} match={match} darkMode={darkMode} />
                ))
              ) : (
                <div className="text-accent-light py-2 px-4">
                  Maç bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoresSection;