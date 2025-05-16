import React, { useState, useEffect } from 'react';
import { fetchFootballScores } from '../services/scoresService';
import ScoreCard from './ScoreCard';
import ScoreCardSkeleton from './ScoreCardSkeleton';
import { Match } from '../types/Match';

interface ScoresSectionProps {
  darkMode: boolean;
}

const ScoresSection: React.FC<ScoresSectionProps> = ({ darkMode }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'today' | 'upcoming'>('live');

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

  return (
    <section className="w-full bg-primary dark:bg-primary-dark shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
              activeTab === 'live' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Canlı
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
              activeTab === 'today' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
              activeTab === 'upcoming' 
                ? 'bg-accent text-white' 
                : 'text-accent-light hover:text-white'
            }`}
          >
            Yaklaşan
          </button>
        </div>
        
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-4 min-w-max">
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
    </section>
  );
};

export default ScoresSection;