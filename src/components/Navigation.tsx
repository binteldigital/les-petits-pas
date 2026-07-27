import React from 'react';

interface NavigationProps {
  currentPage: 'feed' | 'social' | 'messages' | 'profile';
  onNavigate: (page: 'feed' | 'social' | 'messages' | 'profile') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 rounded-t-lg bg-surface border-t border-outline-variant shadow-[0_-4px_20px_rgba(48,98,138,0.1)] flex justify-around items-center h-20 pb-safe px-2">
      {/* Tab: Accueil */}
      <button
        onClick={() => onNavigate('feed')}
        className={`flex flex-col items-center justify-center active:scale-90 duration-200 transition-all ${
          currentPage === 'feed'
            ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1.5'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentPage === 'feed' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[11px] font-bold tracking-wider font-quicksand mt-0.5">Accueil</span>
      </button>

      {/* Tab: Réseau */}
      <button
        onClick={() => onNavigate('social')}
        className={`flex flex-col items-center justify-center active:scale-90 duration-200 transition-all ${
          currentPage === 'social'
            ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1.5'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentPage === 'social' ? "'FILL' 1" : "'FILL' 0" }}
        >
          groups
        </span>
        <span className="text-[11px] font-bold tracking-wider font-quicksand mt-0.5">Réseau</span>
      </button>

      {/* Tab: Messages */}
      <button
        onClick={() => onNavigate('messages')}
        className={`flex flex-col items-center justify-center active:scale-90 duration-200 transition-all ${
          currentPage === 'messages'
            ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1.5'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentPage === 'messages' ? "'FILL' 1" : "'FILL' 0" }}
        >
          chat_bubble
        </span>
        <span className="text-[11px] font-bold tracking-wider font-quicksand mt-0.5">Messages</span>
      </button>

      {/* Tab: Profil */}
      <button
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center active:scale-90 duration-200 transition-all ${
          currentPage === 'profile'
            ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1.5'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentPage === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
        >
          face
        </span>
        <span className="text-[11px] font-bold tracking-wider font-quicksand mt-0.5">Profil</span>
      </button>
    </nav>
  );
};
