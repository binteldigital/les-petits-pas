import React, { useState, useRef, useEffect } from 'react';
import type { User, Conversation } from '../types';

interface MessagesProps {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onStartConversation: (targetUserId: string) => void;
}

export const Messages: React.FC<MessagesProps> = ({
  currentUser,
  users,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onStartConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Find active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Get recipient details
  const getRecipient = (conv: Conversation) => {
    const recipientId = conv.participants.find(id => id !== currentUser.id);
    return users.find(u => u.id === recipientId) || {
      id: 'unknown',
      name: 'Utilisateur inconnu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
      role: 'parent' as const,
      following: []
    };
  };

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const handleSend = () => {
    if (inputText.trim() === '' || !activeConversationId) return;
    
    // User message
    onSendMessage(activeConversationId, inputText.trim());
    setInputText('');

    // Trigger mock response
    setIsTyping(true);
    const recipient = getRecipient(activeConversation!);
    
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Entendu, merci !";
      if (recipient.role === 'admin') {
        replyText = `Bonjour, bien reçu. L'équipe d'animation du Jardin d'enfants est prévenue.`;
      } else {
        const parentReplies = [
          "Super ! Pas de problème, on se tient au courant.",
          "Génial ! Je te dis ça ce soir.",
          "Ça marche ! À tout à l'heure à la sortie d'école.",
          "Pas de soucis !"
        ];
        replyText = parentReplies[Math.floor(Math.random() * parentReplies.length)];
      }
      onSendMessage(activeConversationId, replyText);
    }, 2000);
  };

  const handleStartNewChat = (userId: string) => {
    onStartConversation(userId);
    setIsNewChatModalOpen(false);
  };

  // Filter contacts for starting a new chat
  const availableContacts = users.filter(u => {
    if (u.id === currentUser.id) return false;
    return u.name.toLowerCase().includes(searchContactQuery.toLowerCase());
  });

  return (
    <div className="bg-background min-h-screen text-on-surface pb-24 font-quicksand">
      
      {/* Top App Bar */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-container-margin h-16 glass-header">
        <div className="flex items-center gap-3">
          {activeConversationId && (
            <button 
              onClick={() => onSelectConversation(null)}
              className="material-symbols-outlined text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95 duration-150 md:hidden"
            >
              arrow_back
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-primary tracking-tight">
              {activeConversationId ? getRecipient(activeConversation!).name : 'Messagerie Privée'}
            </span>
            {activeConversationId && (
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> En ligne
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsNewChatModalOpen(true)}
          className="material-symbols-outlined text-primary hover:bg-surface-container-low p-2.5 rounded-full transition-colors active:scale-95 duration-150"
        >
          chat_bubble_outline
        </button>
      </nav>

      {/* Main Grid: Left sidebar (list), Right pane (messages) */}
      <main className="pt-16 max-w-5xl mx-auto flex h-[calc(100vh-144px)] overflow-hidden">
        
        {/* Chats List Column */}
        <section className={`w-full md:w-80 bg-white border-r border-outline-variant/30 flex-shrink-0 overflow-y-auto ${
          activeConversationId ? 'hidden md:block' : 'block'
        }`}>
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <h2 className="text-[16px] font-bold text-primary">Discussions</h2>
            <button 
              onClick={() => setIsNewChatModalOpen(true)}
              className="text-[12px] text-primary font-bold hover:underline"
            >
              Nouveau +
            </button>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {conversations.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-on-surface-variant italic px-4">
                Aucune conversation active. Cliquez sur "Nouveau" pour démarrer.
              </div>
            ) : (
              conversations.map((conv) => {
                const recipient = getRecipient(conv);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isActive = conv.id === activeConversationId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors ${
                      isActive ? 'bg-primary-container/20 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full object-cover border"
                        src={recipient.avatar}
                        alt={recipient.name}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[13.5px] truncate">{recipient.name}</span>
                        {lastMsg && <span className="text-[10px] text-on-surface-variant">{lastMsg.time}</span>}
                      </div>
                      <p className="text-[12.5px] text-on-surface-variant truncate mt-0.5">
                        {lastMsg ? `${lastMsg.senderId === currentUser.id ? 'Vous: ' : ''}${lastMsg.text}` : 'Aucun message'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Messaging Area Panel */}
        <section className={`flex-1 flex flex-col justify-between bg-surface-container-lowest/30 ${
          activeConversationId ? 'block' : 'hidden md:flex items-center justify-center text-on-surface-variant italic text-[14px]'
        }`}>
          {activeConversationId && activeConversation ? (
            <>
              {/* Message History flow */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {activeConversation.messages.map((msg) => {
                  const isOwnMessage = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className="space-y-1">
                      <div className={`flex items-end gap-2 max-w-[85%] ${isOwnMessage ? 'ml-auto flex-row-reverse' : ''}`}>
                        {/* Avatar for incoming */}
                        {!isOwnMessage && (
                          <img
                            className="w-8 h-8 rounded-full object-cover border border-primary-container"
                            src={getRecipient(activeConversation).avatar}
                            alt="avatar"
                          />
                        )}
                        
                        {/* Message text bubble */}
                        <div
                          className={`p-3.5 rounded-lg soft-shadow text-[13.5px] leading-relaxed ${
                            isOwnMessage
                              ? 'bg-primary text-white rounded-br-none ml-auto'
                              : 'bg-white border border-outline-variant/30 text-on-surface rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span className={`text-[9px] block text-right mt-1 opacity-70`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>

                      {/* Optional Attached files */}
                      {msg.attachment && (
                        <div className={`flex items-end gap-2 max-w-[85%] ${isOwnMessage ? 'flex-row-reverse ml-auto' : ''}`}>
                          {!isOwnMessage && <div className="w-8 h-8"></div>}
                          <div className="bg-primary-container/30 p-2 rounded-lg border border-primary-container max-w-sm">
                            <div className="bg-white rounded overflow-hidden border border-outline-variant/40">
                              <img className="w-full h-32 object-cover" src={msg.attachment.image} alt={msg.attachment.name} />
                              <div className="p-2 flex items-center justify-between gap-4">
                                <span className="text-[11px] font-bold truncate">{msg.attachment.name}</span>
                                <button className="material-symbols-outlined text-primary text-[18px]">download</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Simulated typing indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <img
                      className="w-8 h-8 rounded-full object-cover border border-primary-container"
                      src={getRecipient(activeConversation).avatar}
                      alt="avatar"
                    />
                    <div className="bg-white px-3.5 py-2.5 rounded-full border border-outline-variant/30 flex gap-1 items-center">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="bg-white border-t border-outline-variant/30 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert("Pièces jointes non disponibles pour cette démo.")}
                    className="material-symbols-outlined text-primary p-2 bg-surface-container-low rounded-full hover:bg-primary-container/20"
                  >
                    add_photo_alternate
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-surface-container-low border-none rounded-full px-5 py-3 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-primary text-white w-11 h-11 rounded-full flex items-center justify-center shadow hover:bg-on-primary-fixed-variant active:scale-90 transition-transform flex-shrink-0"
                  >
                    <span className="material-symbols-outlined translate-x-0.5">send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-2">
              <span className="material-symbols-outlined text-outline text-5xl">forum</span>
              <p>Sélectionnez une discussion pour commencer à clavarder</p>
            </div>
          )}
        </section>
      </main>

      {/* NEW CHAT / CONTACTS SELECTION MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-slide-up">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 max-h-[80vh] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-[17px] font-bold text-primary">Nouvelle conversation</h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search Contact */}
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchContactQuery}
              onChange={(e) => setSearchContactQuery(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-full px-4 py-2.5 text-[13px]"
            />

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-outline-variant/10 pr-1 mt-2">
              {availableContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleStartNewChat(contact.id)}
                  className="flex items-center gap-3 py-2.5 px-1 cursor-pointer hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <img className="w-9 h-9 rounded-full object-cover border" src={contact.avatar} alt={contact.name} />
                  <div>
                    <span className="font-bold text-[13.5px] block leading-none">{contact.name}</span>
                    <span className="text-[11px] text-on-surface-variant font-medium mt-1 inline-block">
                      {contact.role === 'admin' ? 'Administration Crèche' : `Parent de ${contact.childName}`}
                    </span>
                  </div>
                </div>
              ))}
              {availableContacts.length === 0 && (
                <p className="text-center py-6 text-on-surface-variant italic text-[12px]">Aucun contact trouvé.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
