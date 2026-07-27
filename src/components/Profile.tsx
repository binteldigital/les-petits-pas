import React, { useState } from 'react';
import type { User, Post, ChildProfileData } from '../types';

interface ProfileProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  profile: ChildProfileData;
  onUpdateProfile: (updatedProfile: ChildProfileData) => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onStartChat: (targetUserId: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  currentUser,
  users,
  posts,
  profile,
  onUpdateProfile,
  onUpdateUser,
  onLogout,
  onStartChat,
}) => {
  // Navigation & Modal triggers
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username || currentUser.name.toLowerCase().replace(' ', '_'));
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  
  // Child PAI fields (in settings modal)
  const [isEditingPAI, setIsEditingPAI] = useState(false);
  const [editChildName, setEditChildName] = useState(profile.name);
  const [editChildGroup, setEditChildGroup] = useState(profile.group);
  const [editChildBirth, setEditChildBirth] = useState(profile.birthdate);
  const [editChildAllergies, setEditChildAllergies] = useState(profile.allergies.join(', '));

  // Admin selected kid details modal
  const [selectedKid, setSelectedKid] = useState<User | null>(null);

  // Filter posts published by current user
  const userPosts = posts.filter(post => post.authorId === currentUser.id);

  // Stats calculation
  const publicationsCount = userPosts.length;
  // Follower count: dynamically calculated based on who is following the user
  const followersCount = users.filter(u => u.following.includes(currentUser.id)).length;
  const followingCount = currentUser.following.length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: editName,
      username: editUsername,
      bio: editBio,
      website: editWebsite
    });
    setIsEditProfileOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({
          ...currentUser,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePAI = () => {
    onUpdateProfile({
      ...profile,
      name: editChildName,
      group: editChildGroup,
      birthdate: editChildBirth,
      allergies: editChildAllergies.split(',').map(s => s.trim()).filter(Boolean)
    });
    setIsEditingPAI(false);
  };

  const handleAddContact = () => {
    const contactName = prompt("Nom complet de l'accompagnateur à autoriser :");
    if (!contactName) return;
    const role = prompt("Relation avec l'enfant (ex: Oncle, Mamie, Babysitter) :", "Proche");
    if (!role) return;
    const phone = prompt("Numéro de téléphone :", "0600000000");
    if (!phone) return;

    const newContacts = [
      ...profile.authorizedContacts,
      {
        name: contactName,
        role: role,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
        phone: phone,
        isOccasional: true
      }
    ];

    onUpdateProfile({
      ...profile,
      authorizedContacts: newContacts
    });
  };

  const isAdmin = currentUser.role === 'admin';
  const registeredChildren = users.filter(u => u.role === 'parent');

  return (
    <div className="bg-background min-h-screen text-on-surface pb-24 font-quicksand">
      
      {/* ================= PARENT INSTAGRAM STYLE PROFILE ================= */}
      {!isAdmin ? (
        <>
          {/* Top Instagram Header */}
          <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 z-40 px-4 flex justify-between items-center">
            <button 
              onClick={() => alert("Ajout de contenu indisponible sur cette démo.")}
              className="material-symbols-outlined text-primary text-[24px]"
            >
              add
            </button>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-bold text-[15px] tracking-tight">
                {currentUser.username || currentUser.name.toLowerCase().replace(' ', '_')}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="material-symbols-outlined text-primary text-[24px] hover:text-primary-container transition-colors"
              >
                menu
              </button>
            </div>
          </header>

          {/* Profile Core Container */}
          <div className="pt-16 px-4 space-y-4 max-w-2xl mx-auto">
            
            {/* Avatar & Stats Row */}
            <div className="flex items-center justify-between gap-6 py-2">
              {/* Left Column: Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-[84px] h-[84px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-surface-container-high">
                    <img className="w-full h-full object-cover" src={currentUser.avatar} alt="avatar" />
                  </div>
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-white w-[22px] h-[22px] rounded-full border-2 border-white flex items-center justify-center hover:scale-110 duration-150 cursor-pointer shadow">
                  <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Right Column: Stats */}
              <div className="flex-1 flex justify-around text-center pr-2 text-on-surface">
                <div>
                  <p className="text-[17px] font-bold leading-tight">{publicationsCount}</p>
                  <p className="text-[12px] text-on-surface-variant font-medium">publications</p>
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-tight">{followersCount}</p>
                  <p className="text-[12px] text-on-surface-variant font-medium">followers</p>
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-tight">{followingCount}</p>
                  <p className="text-[12px] text-on-surface-variant font-medium">suivis</p>
                </div>
              </div>
            </div>

            {/* Profile Bio Details */}
            <div className="space-y-1 text-[13.5px]">
              <h2 className="font-bold text-[14.5px]">{currentUser.name}</h2>
              
              {/* Bio lines */}
              <p className="text-on-surface-variant leading-snug whitespace-pre-line font-medium">
                {currentUser.bio || "Aucune biographie rédigée. Cliquez sur Modifier pour en ajouter une ! ✨"}
              </p>

              {/* Website Link */}
              {currentUser.website && (
                <div className="flex items-center gap-1.5 text-blue-500 hover:underline pt-1">
                  <span className="material-symbols-outlined text-[15px]">link</span>
                  <a href={`https://${currentUser.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold">
                    {currentUser.website}
                  </a>
                </div>
              )}
            </div>

            {/* Gray Dashboard Box */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5 flex flex-col space-y-0.5 shadow-sm">
              <span className="text-[13px] font-bold text-on-surface">Votre tableau de bord</span>
              <span className="text-[11.5px] text-on-surface-variant font-medium">198 vues au cours des 30 derniers jours.</span>
            </div>

            {/* Edit / Share Action Buttons */}
            <div className="flex gap-2 text-[13px]">
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="flex-1 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg font-bold transition-colors active:scale-95"
              >
                Modifier
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Lien du profil copié !");
                }}
                className="flex-1 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg font-bold transition-colors active:scale-95"
              >
                Partager le profil
              </button>
              <button 
                onClick={handleAddContact}
                className="px-2.5 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg flex items-center justify-center transition-colors active:scale-95"
                title="Ajouter accompagnateur"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </button>
            </div>

            {/* Profile Tabs Navigation Grid */}
            <div className="flex justify-around border-b border-outline-variant/30 text-on-surface-variant">
              <button 
                onClick={() => setActiveTab('grid')}
                className={`flex-1 py-3 flex items-center justify-center border-b-2 transition-colors ${
                  activeTab === 'grid' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">grid_on</span>
              </button>
              <button 
                onClick={() => setActiveTab('reels')}
                className={`flex-1 py-3 flex items-center justify-center border-b-2 transition-colors ${
                  activeTab === 'reels' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">smart_display</span>
              </button>
              <button 
                onClick={() => setActiveTab('tagged')}
                className={`flex-1 py-3 flex items-center justify-center border-b-2 transition-colors ${
                  activeTab === 'tagged' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">account_box</span>
              </button>
            </div>

            {/* Tab Content: Grid of published posts */}
            {activeTab === 'grid' && (
              <div className="grid grid-cols-3 gap-1.5 -mx-4 px-4 mt-2">
                {userPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-surface-container-low overflow-hidden cursor-pointer relative group border border-outline-variant/20 rounded-lg shadow-sm"
                  >
                    <img className="w-full h-full object-cover group-hover:scale-105 duration-200" src={post.image} alt={post.tag} />
                    
                    {/* Hover Stats Panel */}
                    <div className="absolute inset-0 bg-[#0f141c]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-[13px] font-bold rounded-lg">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        {post.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                        {post.comments.length}
                      </span>
                    </div>
                  </div>
                ))}
                
                {userPosts.length === 0 && (
                  <div className="col-span-3 text-center py-20 text-[13.5px] text-on-surface-variant space-y-4 px-4">
                    <span className="material-symbols-outlined text-4xl text-outline">camera_alt</span>
                    <p className="font-bold text-on-surface">Partagez vos moments</p>
                    <p className="text-[12.5px] max-w-xs mx-auto text-on-surface-variant font-medium">
                      Vos photos de sorties scolaires et activités d'éveil s'afficheront ici.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Reels (Mock) */}
            {activeTab === 'reels' && (
              <div className="text-center py-16 text-[13px] text-on-surface-variant italic font-medium">
                Aucun Reel publié pour le moment.
              </div>
            )}

            {/* Tab Content: Tagged (Mock) */}
            {activeTab === 'tagged' && (
              <div className="text-center py-16 text-[13px] text-on-surface-variant italic font-medium">
                Aucune publication identifiée.
              </div>
            )}

          </div>
        </>
      ) : (
        // ================= ADMINISTRATOR INTERFACE =================
        <>
          <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-outline-variant/30 shadow-sm">
            <button 
              onClick={onLogout}
              className="active:scale-95 duration-150 hover:bg-red-500/10 text-red-500 transition-colors px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Quitter
            </button>
            <h1 className="text-[18px] font-bold text-primary tracking-tight">Direction Crèche</h1>
            <div className="w-16"></div>
          </header>

          <main className="pt-20 px-4 space-y-6 max-w-2xl mx-auto">
            <section className="bg-white p-5 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
              <div className="w-20 h-20 rounded-full border border-outline-variant overflow-hidden bg-surface-container-high">
                <img className="w-full h-full object-cover" src={currentUser.avatar} alt="admin" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-on-surface">{currentUser.name}</h2>
                <p className="text-[12px] text-on-surface-variant font-medium">Administration générale Crèche</p>
                <p className="text-[12px] text-primary font-semibold mt-1">Espace de gestion des familles</p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[16px] font-bold text-primary">Gestion des Enfants</h3>
              <div className="grid grid-cols-1 gap-3">
                {registeredChildren.map((parent) => (
                  <div 
                    key={parent.id}
                    className="bg-white p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between hover:shadow transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-primary-container/20 flex items-center justify-center border border-primary/20 text-primary">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>child_care</span>
                      </div>
                      <div>
                        <p className="text-[14.5px] font-bold text-on-surface">{parent.childName || 'Enfant'}</p>
                        <p className="text-[11.5px] text-on-surface-variant font-medium">Famille : {parent.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedKid(parent)}
                        className="px-3 py-1.5 bg-surface-container-low text-[12px] font-bold rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        Dossier
                      </button>
                      <button
                        onClick={() => onStartChat(parent.id)}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-transform active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* ================= MODAL: EDIT INSTAGRAM BIO DETAILS ================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-outline-variant/30 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-[17px] font-bold text-primary">Modifier le profil</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-[13.5px]">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Nom complet</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Nom d'utilisateur (Username)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Biographie (Bio)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Écrivez une courte bio..."
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Lien Web (Site internet)</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  placeholder="www.mon-site.com"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#205178] text-white rounded-lg font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTAGRAM STYLE SETTINGS PANEL ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-outline-variant/30 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                <h3 className="text-[17px] font-bold text-primary">Options & Réglages</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2.5 divide-y divide-outline-variant/20 text-[14px]">
              
              {/* Option: PAI Child Alert edit */}
              <div className="py-3">
                <button 
                  onClick={() => {
                    setIsEditingPAI(true);
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left flex justify-between items-center group"
                >
                  <span className="flex items-center gap-2 text-on-surface font-semibold group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">medical_services</span>
                    Dossier Médical & PAI de l'enfant
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>

              {/* Option: Active notifications toggle */}
              <div className="py-3 flex justify-between items-center">
                <span className="flex items-center gap-2 text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications_active</span>
                  Notifications push
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full text-xs font-bold">Activées</span>
              </div>

              {/* Option: Logout */}
              <div className="py-3 pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={() => {
                    setIsSettingsOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-200 rounded-lg text-red-500 font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CHILD HEALTH / PAI DATA ================= */}
      {isEditingPAI && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-outline-variant/30 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-[17px] font-bold text-primary">Dossier Santé de l'enfant</h3>
              <button onClick={() => { setIsEditingPAI(false); setIsSettingsOpen(true); }} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-[13.5px]">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Nom complet de l'enfant</label>
                <input
                  type="text"
                  value={editChildName}
                  onChange={(e) => setEditChildName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-bold mb-1">Groupe</label>
                  <input
                    type="text"
                    value={editChildGroup}
                    onChange={(e) => setEditChildGroup(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-bold mb-1">Date de naissance</label>
                  <input
                    type="text"
                    value={editChildBirth}
                    onChange={(e) => setEditChildBirth(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-[14px] text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-red-500 font-bold mb-1">PAI / Allergies (séparer par virgule)</label>
                <input
                  type="text"
                  value={editChildAllergies}
                  onChange={(e) => setEditChildAllergies(e.target.value)}
                  className="w-full bg-surface-container-low border border-red-200 rounded-lg px-4 py-2.5 text-[14px] text-red-750 focus:border-red-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => { setIsEditingPAI(false); setIsSettingsOpen(true); }}
                className="px-4 py-2 rounded-lg text-on-surface-variant font-bold"
              >
                Retour
              </button>
              <button
                onClick={handleSavePAI}
                className="px-5 py-2 bg-primary hover:bg-[#205178] text-white rounded-lg font-bold"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTAGRAM STYLE GRID POST DETAIL VIEW ================= */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-outline-variant/30 shadow-2xl text-on-surface">
            
            {/* Header */}
            <div className="p-3 flex justify-between items-center border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8 rounded-full object-cover" src={currentUser.avatar} alt="avatar" />
                <span className="font-bold text-[13.5px]">{currentUser.username || currentUser.name.toLowerCase().replace(' ', '_')}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Post Image */}
            <div className="aspect-square bg-black">
              <img className="w-full h-full object-cover" src={selectedPost.image} alt="post" />
            </div>

            {/* Footer comments & description */}
            <div className="p-4 space-y-2 text-[13px]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
                  <span className="material-symbols-outlined text-primary text-[24px]">chat_bubble</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-semibold">{selectedPost.time}</span>
              </div>
              
              <p className="font-bold text-on-surface">
                {selectedPost.likes.length} J'aime
              </p>
              
              <p className="leading-relaxed text-on-surface font-medium">
                <span className="font-bold mr-1.5">{currentUser.username || currentUser.name.toLowerCase().replace(' ', '_')}</span>
                {selectedPost.description}
              </p>

              {/* Comments details */}
              {selectedPost.comments.length > 0 && (
                <div className="pt-2 border-t border-outline-variant/20 space-y-1">
                  <p className="text-on-surface-variant text-[12px] font-bold">Commentaires :</p>
                  {selectedPost.comments.map((comment) => (
                    <p key={comment.id} className="text-on-surface font-medium">
                      <span className="font-bold mr-1.5 text-on-surface">{comment.authorName}</span>
                      {comment.text}
                    </p>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: ADMIN DETAIL VIEW OF A CHILD ================= */}
      {selectedKid && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-outline-variant/30 text-on-surface shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant/35 pb-2">
              <h3 className="text-[16px] font-bold text-primary font-quicksand">Dossier Enfant : {selectedKid.childName}</h3>
              <button onClick={() => setSelectedKid(null)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="bg-surface-container-low p-3.5 rounded-lg space-y-2 border border-outline-variant/20">
                <p><strong>Parent associé :</strong> {selectedKid.name}</p>
                <p><strong>Nom d'utilisateur :</strong> @{selectedKid.username}</p>
                <p><strong>Adresse e-mail :</strong> {selectedKid.email}</p>
                <p><strong>Groupe scolaire :</strong> Les Explorateurs</p>
              </div>

              <div className="bg-red-50 text-red-700 p-3.5 rounded-lg border border-red-250 space-y-1">
                <div className="flex items-center gap-1.5 text-red-700 font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                  <span>Alerte Santé / PAI</span>
                </div>
                <p className="text-on-surface font-bold">Allergie sévère aux arachides (Protocole PAI actif)</p>
                <p className="text-on-surface-variant">Vaccins à jour (Dernière vérification 01/24)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedKid(null)}
                className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-lg text-[13px] font-bold"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  onStartChat(selectedKid.id);
                  setSelectedKid(null);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold flex items-center gap-1 hover:bg-[#205178]"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Contacter la famille
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
