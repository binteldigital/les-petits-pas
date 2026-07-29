import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { User, Post, Story, Conversation, Notification, ChatMessage, PostComment, ChildProfileData } from './types';

// Helpers to format time ago (like "Il y a 2h", "À l'instant")
const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 3600000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}m`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  
  // Format standard: dd/mm/yyyy
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ==========================================
// FALLBACK STORAGE (LOCALSTORAGE / MOCKS)
// ==========================================
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultValue;
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// DATABASE SERVICE IMPL
// ==========================================
export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  // ------------------------------------------
  // 1. AUTHENTICATION
  // ------------------------------------------
  async signIn(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured) {
      // Mock lookup
      const users = getLocalData<User[]>('pl_users', []);
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error("Compte introuvable en mode hors-ligne.");
      }
      return found;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Erreur d'authentification.");

    // Retrieve profile
    return this.getUserProfile(data.user.id);
  },

  async signUp(email: string, password: string, metadata: { name: string; role: 'parent' | 'admin'; childName?: string; avatar?: string }): Promise<User> {
    if (!isSupabaseConfigured) {
      // Mock signup
      const users = getLocalData<User[]>('pl_users', []);
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: metadata.name,
        email: email,
        avatar: metadata.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        role: metadata.role,
        following: [],
        childName: metadata.childName,
        username: metadata.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100)
      };
      
      const updated = [...users, newUser];
      setLocalData('pl_users', updated);
      return newUser;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata.name,
          role: metadata.role,
          childName: metadata.childName,
          avatar: metadata.avatar,
          username: metadata.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100)
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erreur lors de l'inscription.");

    // The trigger public.handle_new_user() creates the profile. Wait a little bit and fetch it.
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getUserProfile(data.user.id);
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUserSession(): Promise<User | null> {
    if (!isSupabaseConfigured) {
      const savedUserId = localStorage.getItem('pl_current_user_id');
      if (savedUserId) {
        const users = getLocalData<User[]>('pl_users', []);
        return users.find(u => u.id === savedUserId) || null;
      }
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    try {
      return await this.getUserProfile(session.user.id);
    } catch {
      return null;
    }
  },

  // Helper to fetch user profiles + follows
  async getUserProfile(userId: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Get following list
    const { data: followings } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', userId);

    const followingIds = (followings || []).map((f: any) => f.followed_id);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || '',
      role: profile.role as 'parent' | 'admin',
      following: followingIds,
      childName: profile.child_name || undefined,
      username: profile.username || undefined,
      bio: profile.bio || undefined,
      website: profile.website || undefined
    };
  },

  // ------------------------------------------
  // 2. PROFILES & USERS
  // ------------------------------------------
  async getProfiles(): Promise<User[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<User[]>('pl_users', []);
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    const { data: follows } = await supabase
      .from('follows')
      .select('*');

    const followsMap = (follows || []).reduce((acc: Record<string, string[]>, curr: any) => {
      if (!acc[curr.follower_id]) acc[curr.follower_id] = [];
      acc[curr.follower_id].push(curr.followed_id);
      return acc;
    }, {});

    return profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar || '',
      role: p.role as 'parent' | 'admin',
      following: followsMap[p.id] || [],
      childName: p.child_name || undefined,
      username: p.username || undefined,
      bio: p.bio || undefined,
      website: p.website || undefined
    }));
  },

  async updateProfile(user: User): Promise<void> {
    if (!isSupabaseConfigured) {
      const users = getLocalData<User[]>('pl_users', []);
      const updated = users.map(u => u.id === user.id ? user : u);
      setLocalData('pl_users', updated);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        child_name: user.childName || null,
        bio: user.bio || null,
        website: user.website || null,
        avatar: user.avatar || null
      })
      .eq('id', user.id);

    if (error) throw error;
  },

  async toggleFollow(followerId: string, followedId: string, isFollowing: boolean): Promise<void> {
    if (!isSupabaseConfigured) {
      const users = getLocalData<User[]>('pl_users', []);
      const updated = users.map(u => {
        if (u.id === followerId) {
          const list = isFollowing
            ? u.following.filter(id => id !== followedId)
            : [...u.following, followedId];
          return { ...u, following: list };
        }
        return u;
      });
      setLocalData('pl_users', updated);
      return;
    }

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('followed_id', followedId);
      if (error) throw error;
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, followed_id: followedId });
      if (error) throw error;
    }
  },

  // ------------------------------------------
  // 3. POSTS & INTERACTIONS
  // ------------------------------------------
  async getPosts(): Promise<Post[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<Post[]>('pl_posts', []);
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (name, avatar),
        post_likes (user_id),
        post_comments (
          id,
          text,
          created_at,
          profiles:author_id (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (posts || []).map((dbPost: any) => {
      const comments = (dbPost.post_comments || []).map((c: any) => ({
        id: c.id,
        authorName: c.profiles?.name || 'Anonyme',
        text: c.text,
        time: new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }));
      // S'assurer que les commentaires sont triés par ordre chronologique
      comments.sort((a: any, b: any) => a.id.localeCompare(b.id));

      return {
        id: dbPost.id,
        authorId: dbPost.author_id,
        authorName: dbPost.profiles?.name || 'Crèche',
        authorAvatar: dbPost.profiles?.avatar || '',
        tag: dbPost.tag || '',
        image: dbPost.image,
        description: dbPost.description || '',
        likes: (dbPost.post_likes || []).map((l: any) => l.user_id),
        time: formatTimeAgo(dbPost.created_at),
        comments
      };
    });
  },

  async createPost(authorId: string, tag: string, image: string, description: string): Promise<Post> {
    if (!isSupabaseConfigured) {
      const posts = getLocalData<Post[]>('pl_posts', []);
      const users = getLocalData<User[]>('pl_users', []);
      const author = users.find(u => u.id === authorId);

      const newPost: Post = {
        id: `post-${Date.now()}`,
        authorId,
        authorName: author?.name || 'Direction Crèche',
        authorAvatar: author?.avatar || '',
        tag,
        image,
        description,
        likes: [],
        time: "À l'instant",
        comments: []
      };

      setLocalData('pl_posts', [newPost, ...posts]);
      return newPost;
    }

    const { data: newPostData, error } = await supabase
      .from('posts')
      .insert({
        author_id: authorId,
        tag,
        image,
        description
      })
      .select('*, profiles:author_id (name, avatar)')
      .single();

    if (error) throw error;

    return {
      id: newPostData.id,
      authorId: newPostData.author_id,
      authorName: newPostData.profiles?.name || 'Crèche',
      authorAvatar: newPostData.profiles?.avatar || '',
      tag: newPostData.tag || '',
      image: newPostData.image,
      description: newPostData.description || '',
      likes: [],
      time: "À l'instant",
      comments: []
    };
  },

  async toggleLikePost(postId: string, userId: string, hasLiked: boolean): Promise<void> {
    if (!isSupabaseConfigured) {
      const posts = getLocalData<Post[]>('pl_posts', []);
      const updated = posts.map(p => {
        if (p.id === postId) {
          const likes = hasLiked
            ? p.likes.filter(id => id !== userId)
            : [...p.likes, userId];
          return { ...p, likes };
        }
        return p;
      });
      setLocalData('pl_posts', updated);
      return;
    }

    if (hasLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
      if (error) throw error;
    }
  },

  async addComment(postId: string, authorId: string, text: string): Promise<PostComment> {
    if (!isSupabaseConfigured) {
      const posts = getLocalData<Post[]>('pl_posts', []);
      const users = getLocalData<User[]>('pl_users', []);
      const author = users.find(u => u.id === authorId);

      const newComment: PostComment = {
        id: `comment-${Date.now()}`,
        authorName: author?.name || 'Utilisateur',
        text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const updated = posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      });
      setLocalData('pl_posts', updated);
      return newComment;
    }

    const { data: newCommentData, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        text
      })
      .select('*, profiles:author_id (name)')
      .single();

    if (error) throw error;

    return {
      id: newCommentData.id,
      authorName: newCommentData.profiles?.name || 'Utilisateur',
      text: newCommentData.text,
      time: new Date(newCommentData.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  },

  // ------------------------------------------
  // 4. STORIES
  // ------------------------------------------
  async getStories(): Promise<Story[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<Story[]>('pl_stories', []);
    }

    const { data: stories, error } = await supabase
      .from('stories')
      .select('*, profiles:author_id (name, avatar)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (stories || []).map((dbStory: any) => ({
      id: dbStory.id,
      authorId: dbStory.author_id,
      authorName: dbStory.profiles?.name || 'Crèche',
      authorAvatar: dbStory.profiles?.avatar || '',
      image: dbStory.media,
      time: formatTimeAgo(dbStory.created_at),
      tag: dbStory.target_kids?.[0] || undefined
    }));
  },

  async createStory(authorId: string, image: string, tag?: string): Promise<Story> {
    if (!isSupabaseConfigured) {
      const stories = getLocalData<Story[]>('pl_stories', []);
      const users = getLocalData<User[]>('pl_users', []);
      const author = users.find(u => u.id === authorId);

      const newStory: Story = {
        id: `story-${Date.now()}`,
        authorId,
        authorName: author?.name || 'Crèche',
        authorAvatar: author?.avatar || '',
        image,
        time: "À l'instant",
        tag
      };

      setLocalData('pl_stories', [newStory, ...stories]);
      return newStory;
    }

    const { data: dbStory, error } = await supabase
      .from('stories')
      .insert({
        author_id: authorId,
        media: image,
        media_type: 'image',
        target_kids: tag ? [tag] : []
      })
      .select('*, profiles:author_id (name, avatar)')
      .single();

    if (error) throw error;

    return {
      id: dbStory.id,
      authorId: dbStory.author_id,
      authorName: dbStory.profiles?.name || 'Crèche',
      authorAvatar: dbStory.profiles?.avatar || '',
      image: dbStory.media,
      time: "À l'instant",
      tag: dbStory.target_kids?.[0] || undefined
    };
  },

  // ------------------------------------------
  // 5. MESSAGING & CONVERSATIONS
  // ------------------------------------------
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured) {
      return getLocalData<Conversation[]>('pl_conversations', []);
    }

    // 1. Get participant mappings for this user
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    const convIds = (participations || []).map((p: any) => p.conversation_id);
    if (convIds.length === 0) return [];

    // 2. Fetch full conversation structures
    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants (user_id),
        messages (
          id,
          sender_id,
          text,
          file_url,
          file_name,
          created_at,
          profiles:sender_id (name)
        )
      `)
      .in('id', convIds);

    if (error) throw error;

    return (convs || []).map((c: any) => {
      const messages = (c.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.profiles?.name || 'Utilisateur',
        text: m.text || '',
        time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        attachment: m.file_url ? {
          name: m.file_name || 'Fichier',
          image: m.file_url
        } : undefined
      }));

      // Sort messages chronologically
      messages.sort((a: any, b: any) => a.id.localeCompare(b.id));

      return {
        id: c.id,
        participants: (c.conversation_participants || []).map((cp: any) => cp.user_id),
        messages
      };
    });
  },

  async startConversation(creatorId: string, recipientId: string): Promise<Conversation> {
    if (!isSupabaseConfigured) {
      const convs = getLocalData<Conversation[]>('pl_conversations', []);
      const existing = convs.find(
        c => c.participants.includes(creatorId) && c.participants.includes(recipientId)
      );

      if (existing) return existing;

      const newConv: Conversation = {
        id: `conv-${creatorId}-${recipientId}`,
        participants: [creatorId, recipientId],
        messages: []
      };

      setLocalData('pl_conversations', [newConv, ...convs]);
      return newConv;
    }

    // 1. Create conversation record
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();

    if (convError) throw convError;

    // 2. Add both participants
    const { error: pError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conv.id, user_id: creatorId },
        { conversation_id: conv.id, user_id: recipientId }
      ]);

    if (pError) throw pError;

    return {
      id: conv.id,
      participants: [creatorId, recipientId],
      messages: []
    };
  },

  async sendMessage(conversationId: string, senderId: string, text: string, attachment?: { name: string; image: string }): Promise<ChatMessage> {
    if (!isSupabaseConfigured) {
      const convs = getLocalData<Conversation[]>('pl_conversations', []);
      const users = getLocalData<User[]>('pl_users', []);
      const sender = users.find(u => u.id === senderId);

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        senderName: sender?.name || 'Utilisateur',
        text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        attachment
      };

      const updated = convs.map(c => {
        if (c.id === conversationId) {
          return { ...c, messages: [...c.messages, newMsg] };
        }
        return c;
      });

      setLocalData('pl_conversations', updated);
      return newMsg;
    }

    const { data: dbMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        file_url: attachment?.image || null,
        file_name: attachment?.name || null
      })
      .select('*, profiles:sender_id (name)')
      .single();

    if (error) throw error;

    return {
      id: dbMsg.id,
      senderId: dbMsg.sender_id,
      senderName: dbMsg.profiles?.name || 'Utilisateur',
      text: dbMsg.text || '',
      time: new Date(dbMsg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachment: dbMsg.file_url ? {
        name: dbMsg.file_name || 'Fichier',
        image: dbMsg.file_url
      } : undefined
    };
  },

  // ------------------------------------------
  // 6. NOTIFICATIONS
  // ------------------------------------------
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) {
      const notifs = getLocalData<Notification[]>('pl_notifications', []);
      return notifs.filter(n => n.userId === userId);
    }

    const { data: notifs, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (notifs || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      text: n.text,
      time: formatTimeAgo(n.created_at),
      isRead: n.is_read,
      type: n.type as any
    }));
  },

  async createNotification(userId: string, text: string, type: 'like' | 'comment' | 'message' | 'announcement'): Promise<void> {
    if (!isSupabaseConfigured) {
      const notifs = getLocalData<Notification[]>('pl_notifications', []);
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId,
        text,
        time: "À l'instant",
        isRead: false,
        type
      };
      setLocalData('pl_notifications', [newNotif, ...notifs]);
      return;
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        text,
        type,
        is_read: false
      });
  },

  async markNotificationsAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const notifs = getLocalData<Notification[]>('pl_notifications', []);
      const updated = notifs.map(n => n.userId === userId ? { ...n, isRead: true } : n);
      setLocalData('pl_notifications', updated);
      return;
    }

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  // ------------------------------------------
  // 7. CHILD PROFILES, CONTACTS, DOCUMENTS
  // ------------------------------------------
  async getChildProfile(parentId: string): Promise<ChildProfileData> {
    const defaultData: ChildProfileData = {
      name: 'Léo Dubois',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZDGl8EZVhi_kLK1SYE7GlSV_NQanD1dIM6Tq3ubMIVwkZofV35Jth_TVbUPw6bhlkM0wFdm3IeuaJ84PvM9klJmWbc-3Z5RMHXHHUsZLGQCV9K18jZ58g3X2miLTo329kzbGV3XqT9KC8Ytim3A17VuK3hVkbbYr7mJ8Tlr-gy3Q0UWqmCLTalpU5-bkGBQf9pzYw5Pl4qebFKv7QMiRa85F4XggK2HqNi8Hj4Ts88TrQ_3DfB_SgUvO42y5NeMqvRkUg94It4BJH',
      group: 'Les Explorateurs',
      birthdate: '14 Mars 2021',
      childId: '#CH-2021-LD',
      allergies: ['Allergie sévère aux arachides (Protocole PAI actif)'],
      vaccineStatus: 'Vaccins à jour (Dernière vérification 01/24)',
      authorizedContacts: [
        {
          name: 'Dubois Sophie',
          role: 'Maman',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAmNbxmzz6f44ZxVmj-G1_NYiyTVX41ovIL6hejQ4omuk_w8aTUoYVBtna9jGd74FE1tdsSOHLupPHPedhlnAnf-Eh_DRTo5hEepL_Q-a9q3fvHGNa0ckPwp5Pbmph6A3w7r7ViYFvFmNj1ZFv2KENNSg7A5zEigde3r1fGGGaRVR5N0w9dS8eIyp6iCFaVPqpfN5ymr7XRIbWDs2dz0MvAqN-ZrzG2gqPoHN1ghppqnv3jLmNUR6UBbM21hbTNxfzb8IFRP8R0JYw',
          phone: '0600000000',
          isPrimary: true
        }
      ],
      documents: [
        {
          name: 'Certificat_Med.pdf',
          type: 'pdf'
        }
      ]
    };

    if (!isSupabaseConfigured) {
      return getLocalData<ChildProfileData>('pl_child_profile', defaultData);
    }

    // 1. Fetch child profile
    const { data: dbProfile, error } = await supabase
      .from('child_profiles')
      .select(`
        *,
        child_contacts (*),
        child_documents (*)
      `)
      .eq('parent_id', parentId)
      .maybeSingle();

    if (error) throw error;

    // If child profile doesn't exist, we insert a default one for this parent
    if (!dbProfile) {
      const { data: newProfile, error: insError } = await supabase
        .from('child_profiles')
        .insert({
          parent_id: parentId,
          name: 'Léo Dubois',
          avatar: defaultData.avatar,
          group: defaultData.group,
          birthdate: defaultData.birthdate,
          child_id_code: `#CH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
          allergies: defaultData.allergies,
          vaccine_status: defaultData.vaccineStatus
        })
        .select()
        .single();

      if (insError) throw insError;

      // Add default contacts
      await supabase.from('child_contacts').insert([
        {
          child_profile_id: newProfile.id,
          name: 'Dubois Sophie',
          role: 'Maman',
          avatar: defaultData.authorizedContacts[0].avatar,
          phone: defaultData.authorizedContacts[0].phone,
          is_primary: true
        }
      ]);

      // Add default documents
      await supabase.from('child_documents').insert([
        {
          child_profile_id: newProfile.id,
          name: 'Certificat_Med.pdf',
          doc_type: 'pdf'
        }
      ]);

      // Retrieve full newly created profile
      return this.getChildProfile(parentId);
    }

    const contacts = (dbProfile.child_contacts || []).map((c: any) => ({
      name: c.name,
      role: c.role,
      avatar: c.avatar || '',
      phone: c.phone || '',
      isPrimary: c.is_primary,
      isOccasional: c.is_occasional
    }));

    const documents = (dbProfile.child_documents || []).map((d: any) => ({
      name: d.name,
      type: d.doc_type as 'image' | 'pdf',
      url: d.url || undefined
    }));

    return {
      name: dbProfile.name,
      avatar: dbProfile.avatar || '',
      group: dbProfile.group,
      birthdate: dbProfile.birthdate || '',
      childId: dbProfile.child_id_code || '',
      allergies: dbProfile.allergies || [],
      vaccineStatus: dbProfile.vaccine_status || '',
      authorizedContacts: contacts,
      documents
    };
  },

  async updateChildProfile(parentId: string, childData: ChildProfileData): Promise<void> {
    if (!isSupabaseConfigured) {
      setLocalData('pl_child_profile', childData);
      return;
    }

    // 1. Get profile id
    const { data: dbProfile, error: fetchError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('parent_id', parentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Update profile table
    const { error: updError } = await supabase
      .from('child_profiles')
      .update({
        name: childData.name,
        avatar: childData.avatar,
        group: childData.group,
        birthdate: childData.birthdate,
        allergies: childData.allergies,
        vaccine_status: childData.vaccineStatus
      })
      .eq('id', dbProfile.id);

    if (updError) throw updError;

    // 3. Update contacts & documents - to keep sync simple, we delete and recreate
    const { error: delCError } = await supabase
      .from('child_contacts')
      .delete()
      .eq('child_profile_id', dbProfile.id);
    if (delCError) throw delCError;

    if (childData.authorizedContacts.length > 0) {
      const insContacts = childData.authorizedContacts.map(c => ({
        child_profile_id: dbProfile.id,
        name: c.name,
        role: c.role,
        avatar: c.avatar || null,
        phone: c.phone || null,
        is_primary: !!c.isPrimary,
        is_occasional: !!c.isOccasional
      }));
      const { error: insCError } = await supabase.from('child_contacts').insert(insContacts);
      if (insCError) throw insCError;
    }

    const { error: delDError } = await supabase
      .from('child_documents')
      .delete()
      .eq('child_profile_id', dbProfile.id);
    if (delDError) throw delDError;

    if (childData.documents.length > 0) {
      const insDocs = childData.documents.map(d => ({
        child_profile_id: dbProfile.id,
        name: d.name,
        doc_type: d.type,
        url: d.url || null
      }));
      const { error: insDError } = await supabase.from('child_documents').insert(insDocs);
      if (insDError) throw insDError;
    }
  }
};
