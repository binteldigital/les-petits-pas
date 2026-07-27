import React, { useState, useEffect } from 'react';
import type { User, Post, Story, Notification } from '../types';

interface FeedProps {
  currentUser: User;
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onAddPost: (tag: string, image: string, description: string) => void;
  onAddStory: (image: string, tag?: string) => void;
  onMarkNotificationsRead: () => void;
}


export const Feed: React.FC<FeedProps> = ({
  currentUser,
  posts,
  stories,
  notifications,
  onLikePost,
  onAddComment,
  onAddPost,
  onAddStory,
  onMarkNotificationsRead,
}) => {
  // Views states
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Stories player states
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Creation modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // New Post form state
  const [postDescription, setPostDescription] = useState('');
  const [postTag, setPostTag] = useState('Activité');
  const [customPostImageUrl, setCustomPostImageUrl] = useState('');

  // New Story form state
  const [customStoryImageUrl, setCustomStoryImageUrl] = useState('');
  const [storyTag, setStoryTag] = useState('Fun');

  // Floating reactions for story
  const [storyReactions, setStoryReactions] = useState<{ id: number; emoji: string }[]>([]);

  // Local device file upload state
  const [postFileName, setPostFileName] = useState('');
  const [storyFileName, setStoryFileName] = useState('');

  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPostImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomStoryImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Handle story playing auto-next
  useEffect(() => {
    let timer: any;
    if (selectedStoryIndex !== null) {
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Go to next story or close
            if (selectedStoryIndex < stories.length - 1) {
              setSelectedStoryIndex(selectedStoryIndex + 1);
              return 0;
            } else {
              setSelectedStoryIndex(null);
              return 0;
            }
          }
          return prev + 2; // progress speed (2% every 100ms = 5 seconds total)
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [selectedStoryIndex, stories]);

  // Reset progress when index changes
  useEffect(() => {
    setStoryProgress(0);
  }, [selectedStoryIndex]);

  const handleStoryReaction = (emoji: string) => {
    // Add floating emoji
    const id = Date.now() + Math.random();
    setStoryReactions(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setStoryReactions(prev => prev.filter(r => r.id !== id));
    }, 1500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImg = customPostImageUrl.trim();
    if (!finalImg) return;
    onAddPost(postTag, finalImg, postDescription);
    setIsPostModalOpen(false);
    setPostDescription('');
    setCustomPostImageUrl('');
    setPostFileName('');
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImg = customStoryImageUrl.trim();
    if (!finalImg) return;
    onAddStory(finalImg, storyTag);
    setIsStoryModalOpen(false);
    setCustomStoryImageUrl('');
    setStoryFileName('');
  };

  const handleCommentSubmit = (postId: string) => {
    if (newCommentText.trim() === '') return;
    onAddComment(postId, newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-quicksand">
      
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-container-margin h-16 glass-header">
        <button 
          onClick={() => setIsNotificationsOpen(true)}
          className="active:scale-95 duration-150 flex items-center p-2 rounded-full hover:bg-surface-container-low transition-colors relative"
        >
          <span className="material-symbols-outlined text-primary">notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-tertiary text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
        <h1 className="text-[20px] font-bold text-primary tracking-tight">Petit Lien</h1>
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="active:scale-95 duration-150 flex items-center p-2 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-primary">add_box</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="pt-20">
        
        {/* Stories Section */}
        <section className="mb-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-inline-gap px-container-margin">
            {/* User Story (Add) */}
            <div 
              onClick={() => setIsStoryModalOpen(true)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low group-active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
              <span className="text-[12px] font-bold text-on-surface-variant">Créer</span>
            </div>

            {/* List of active stories */}
            {stories.map((story, index) => (
              <div 
                key={story.id}
                onClick={() => setSelectedStoryIndex(index)}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full story-ring active:scale-95 transition-transform">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-surface-container">
                    <img className="w-full h-full object-cover" src={story.authorAvatar} alt={story.authorName} />
                  </div>
                </div>
                <span className="text-[12px] font-bold text-on-surface-variant truncate max-w-[64px]">
                  {story.authorId === currentUser.id ? 'Moi' : story.authorName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Feed Posts */}
        <div className="flex flex-col gap-stack-gap px-container-margin max-w-xl mx-auto">
          {posts.map((post) => {
            const hasLiked = post.likes.includes(currentUser.id);
            return (
              <article key={post.id} className="bg-white rounded-lg border border-outline-variant/40 overflow-hidden shadow-sm">
                
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
                      <img className="w-full h-full object-cover" src={post.authorAvatar} alt={post.authorName} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-on-surface leading-none">{post.authorName}</h3>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1">{post.time} • {post.tag}</p>
                    </div>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary p-1 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>

                {/* Post Image */}
                <div className="relative aspect-square bg-surface-container-low w-full">
                  <img className="w-full h-full object-cover" src={post.image} alt={post.tag} />
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
                      {post.tag}
                    </span>
                  </div>
                </div>

                {/* Post Interactions */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    {/* Like Button */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1 active:scale-90 transition-transform ${
                        hasLiked ? 'text-tertiary animate-pulse' : 'text-on-surface-variant'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: hasLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span className="text-[14px] font-bold">{post.likes.length}</span>
                    </button>

                    {/* Comment Drawer Toggle */}
                    <button
                      onClick={() => {
                        setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id);
                        setNewCommentText('');
                      }}
                      className={`flex items-center gap-1 active:scale-90 transition-transform ${
                        activeCommentsPostId === post.id ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined">chat_bubble</span>
                      <span className="text-[14px] font-bold">{post.comments.length}</span>
                    </button>

                    <div className="flex-grow"></div>
                    <button className="text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-[15px] text-on-surface mb-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Liked By Details */}
                  {post.likes.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full border border-white bg-primary-fixed"></div>
                        <div className="w-5 h-5 rounded-full border border-white bg-tertiary-fixed"></div>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {hasLiked 
                          ? `Aimé par vous${post.likes.length > 1 ? ` et ${post.likes.length - 1} autre(s)` : ''}`
                          : `Aimé par ${post.likes.length} personne(s)`}
                      </span>
                    </div>
                  )}

                  {/* Comments Block */}
                  {activeCommentsPostId === post.id && (
                    <div className="mt-4 border-t border-outline-variant/30 pt-4 space-y-3 animate-slide-up">
                      <h4 className="text-[13px] font-bold text-primary">Commentaires</h4>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments.length === 0 ? (
                          <p className="text-[12px] text-on-surface-variant italic">Aucun commentaire pour le moment.</p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="bg-surface-container-low p-2.5 rounded-lg text-[13px]">
                              <div className="flex justify-between font-bold text-[11px] text-primary mb-0.5">
                                <span>{comment.authorName}</span>
                                <span className="text-[9px] text-on-surface-variant font-normal">{comment.time}</span>
                              </div>
                              <p className="text-on-surface">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment row */}
                      <div className="flex gap-2 items-center mt-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          className="flex-1 bg-surface-container-low border-none rounded-full px-4 py-2 text-[13px] focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="bg-primary text-white p-2 rounded-full w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-40"
        style={{ boxShadow: '0 10px 20px rgba(48, 98, 138, 0.2)' }}
      >
        <span className="material-symbols-outlined">edit</span>
      </button>

      {/* STORY VIEWER MODAL */}
      {selectedStoryIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-4">
          
          {/* Top Story Bars */}
          <div className="space-y-4 w-full">
            <div className="flex gap-1.5 w-full">
              {stories.map((s, idx) => (
                <div key={s.id} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width: 
                        idx < selectedStoryIndex 
                          ? '100%' 
                          : idx === selectedStoryIndex 
                            ? `${storyProgress}%` 
                            : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  src={stories[selectedStoryIndex].authorAvatar}
                  alt={stories[selectedStoryIndex].authorName}
                />
                <div>
                  <span className="font-bold text-[14px]">
                    {stories[selectedStoryIndex].authorId === currentUser.id 
                      ? 'Votre story' 
                      : stories[selectedStoryIndex].authorName}
                  </span>
                  <span className="text-[10px] block opacity-85">{stories[selectedStoryIndex].time}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStoryIndex(null)}
                className="text-white hover:bg-white/20 p-1.5 rounded-full flex items-center"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
          </div>

          {/* Story Main Image */}
          <div className="flex-1 flex items-center justify-center my-6 relative select-none">
            
            {/* Tap Left Zone */}
            <div 
              onClick={() => {
                if (selectedStoryIndex > 0) {
                  setSelectedStoryIndex(selectedStoryIndex - 1);
                }
              }}
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            />
            
            {/* Tap Right Zone */}
            <div 
              onClick={() => {
                if (selectedStoryIndex < stories.length - 1) {
                  setSelectedStoryIndex(selectedStoryIndex + 1);
                } else {
                  setSelectedStoryIndex(null);
                }
              }}
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            />

            <img
              className="max-h-[70vh] rounded-lg object-contain w-full"
              src={stories[selectedStoryIndex].image}
              alt="Story Content"
            />

            {/* Floating emojis list */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {storyReactions.map((reaction) => (
                <span
                  key={reaction.id}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 text-5xl animate-bounce"
                  style={{
                    animationDuration: '1.2s',
                    left: `${40 + Math.random() * 20}%`,
                    bottom: `${10 + Math.random() * 60}%`
                  }}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Reactions Footer */}
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 flex justify-around items-center z-20">
            {['❤️', '😊', '😮', '😢', '👍', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleStoryReaction(emoji)}
                className="text-3xl active:scale-70 hover:scale-110 transition-transform p-1.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-slide-up">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-[18px] font-bold text-primary">Créer une Publication</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Catégorie/Tag</label>
                <input
                  type="text"
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  placeholder="Ex: Peinture, Jardinage, Sortie..."
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-[14px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5 ml-2">Sélectionner une photo depuis votre appareil</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-primary-container/20 text-primary border border-primary/20 rounded-lg cursor-pointer hover:bg-primary-container/35 active:scale-95 transition-all text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Choisir une photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                  {postFileName ? (
                    <span className="text-[12px] text-on-surface-variant truncate max-w-[200px]" title={postFileName}>
                      {postFileName}
                    </span>
                  ) : (
                    <span className="text-[12px] text-red-500 font-semibold font-quicksand">Aucune photo sélectionnée (Obligatoire)</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Description</label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Que se passe-t-il aujourd'hui ?..."
                  rows={3}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-[14px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-full text-on-surface-variant font-bold text-[13px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!customPostImageUrl}
                  className={`px-5 py-2 rounded-full font-bold text-[13px] text-white transition-all ${
                    customPostImageUrl
                      ? 'bg-primary hover:bg-on-primary-fixed-variant active:scale-95'
                      : 'bg-surface-container-highest cursor-not-allowed opacity-50'
                  }`}
                >
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STORY MODAL */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-slide-up">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-[18px] font-bold text-primary">Créer une Story</h3>
              <button onClick={() => setIsStoryModalOpen(false)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5 ml-2">Sélectionner une photo depuis votre appareil</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-primary-container/20 text-primary border border-primary/20 rounded-lg cursor-pointer hover:bg-primary-container/35 active:scale-95 transition-all text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Choisir une photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoryFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                  {storyFileName ? (
                    <span className="text-[12px] text-on-surface-variant truncate max-w-[200px]" title={storyFileName}>
                      {storyFileName}
                    </span>
                  ) : (
                    <span className="text-[12px] text-red-500 font-semibold font-quicksand">Aucune photo sélectionnée (Obligatoire)</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Activité/Tag</label>
                <input
                  type="text"
                  value={storyTag}
                  onChange={(e) => setStoryTag(e.target.value)}
                  placeholder="Ex: Sieste, Goûter, Dessin..."
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-[14px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 rounded-full text-on-surface-variant font-bold text-[13px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!customStoryImageUrl}
                  className={`px-5 py-2 rounded-full font-bold text-[13px] text-white transition-all ${
                    customStoryImageUrl
                      ? 'bg-primary hover:bg-on-primary-fixed-variant active:scale-95'
                      : 'bg-surface-container-highest cursor-not-allowed opacity-50'
                  }`}
                >
                  Publier la Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS DRAWER */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm animate-slide-up">
          <div className="bg-white max-w-md w-full h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                  <h3 className="text-[18px] font-bold text-primary">Notifications</h3>
                </div>
                <button 
                  onClick={() => {
                    onMarkNotificationsRead();
                    setIsNotificationsOpen(false);
                  }} 
                  className="text-on-surface-variant flex items-center hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-on-surface-variant italic py-10">Aucune notification.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3.5 rounded-lg border transition-colors flex items-start gap-3 ${
                        notif.isRead 
                          ? 'bg-white border-outline-variant/20' 
                          : 'bg-primary-container/10 border-primary-container/30 font-bold'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                        {notif.type === 'like' ? 'favorite' : notif.type === 'comment' ? 'chat_bubble' : notif.type === 'message' ? 'mail' : 'campaign'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-on-surface leading-normal">{notif.text}</p>
                        <span className="text-[10px] text-on-surface-variant font-normal block mt-1">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  onMarkNotificationsRead();
                  setIsNotificationsOpen(false);
                }}
                className="w-full py-3 bg-primary text-white rounded-full font-bold text-[14px] hover:bg-on-primary-fixed-variant active:scale-95 transition-transform"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
