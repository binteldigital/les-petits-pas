import React, { useState } from 'react';
import type { User } from '../types';

interface SocialDirectoryProps {
  currentUser: User;
  users: User[];
  onToggleFollow: (targetUserId: string) => void;
  onStartChat: (targetUserId: string) => void;
}

export const SocialDirectory: React.FC<SocialDirectoryProps> = ({
  currentUser,
  users,
  onToggleFollow,
  onStartChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out current user and apply search query filter
  const filteredUsers = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    const nameMatch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const childMatch = u.childName?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || roleMatch || childMatch;
  });

  return (
    <div className="bg-background min-h-screen text-on-surface pb-24 font-quicksand">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-container-margin h-16 glass-header">
        <h1 className="text-[20px] font-bold text-primary tracking-tight">Annuaire Scolaire & Réseau</h1>
        <div className="w-10"></div> {/* Spacer to balance layout */}
      </header>

      {/* Search and User List */}
      <main className="pt-20 px-container-margin max-w-4xl mx-auto space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher un parent, un enfant, ou l'administration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant/50 rounded-full pl-12 pr-4 h-12 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        {/* Directory List */}
        <section className="space-y-3">
          <h2 className="text-[16px] font-bold text-primary px-1">Membres de l'établissement</h2>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-outline-variant/30 text-on-surface-variant italic">
              Aucun membre trouvé pour "{searchQuery}"
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isFollowing = currentUser.following.includes(user.id);
              const isAdmin = user.role === 'admin';

              return (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-lg border border-outline-variant/30 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container">
                      <img className="w-full h-full object-cover" src={user.avatar} alt={user.name} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-on-surface">{user.name}</p>
                        {isAdmin ? (
                          <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Parent
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-on-surface-variant font-medium">
                        {isAdmin ? 'Établissement scolaire' : `Parent de ${user.childName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Follow/Unfollow Button (Only for parents, admins are official) */}
                    {!isAdmin && (
                      <button
                        onClick={() => onToggleFollow(user.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold active:scale-95 transition-all ${
                          isFollowing
                            ? 'bg-surface-container-high text-on-surface-variant'
                            : 'bg-primary text-white hover:bg-on-primary-fixed-variant'
                        }`}
                      >
                        {isFollowing ? 'Abonné' : "S'abonner"}
                      </button>
                    )}

                    {/* Chat Trigger Button */}
                    <button
                      onClick={() => onStartChat(user.id)}
                      className="p-2 bg-primary-container/20 text-primary rounded-full hover:bg-primary-container/40 active:scale-90 transition-transform flex items-center"
                      title="Discuter"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
