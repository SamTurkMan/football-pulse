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
    <section id="scores" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-300 dark:border-gray-700">
        Futbol Skorları
      </h2>
      
      <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'live' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Canlı
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'today' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Bugün
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Yaklaşan
        </button>
      </div>
      
      <div className="space-y-4">
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
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Maç bulunamadı.</p>
          </div>
        )}
      </div>
      
      {activeTab === 'live' && matches.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Canlı skorlar her dakika otomatik güncellenir
        </div>
      )}
    </section>
  );
};

export default ScoresSection;