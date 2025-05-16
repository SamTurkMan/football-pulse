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
  const [activeTab, setActiveTab] = useState<'live' | 'today' | 'upcoming'>('live');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const data = await fetchFootballScores(activeTab);
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch football scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
    
    let interval: number | undefined;
    if (activeTab === 'live') {
      interval = window.setInterval(loadScores, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

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
      
      // Check for overflow initially and on resize
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
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center sm:justify-start space-x-4 mb-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'live' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Canlı
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'today' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'upcoming' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Yaklaşan
          </button>
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