import { useState, useEffect } from 'react';
import type { User, Post, Story, Conversation, Notification, ChatMessage, PostComment, ChildProfileData } from './types';
import { Login } from './components/Login';
import { Feed } from './components/Feed';
import { Messages } from './components/Messages';
import { Profile } from './components/Profile';
import { SocialDirectory } from './components/SocialDirectory';
import { Navigation } from './components/Navigation';
import { supabaseService } from './supabaseService';

// MOCK DATA FOR SEEDING
const INITIAL_USERS: User[] = [
  {
    id: 'user-parent',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAmNbxmzz6f44ZxVmj-G1_NYiyTVX41ovIL6hejQ4omuk_w8aTUoYVBtna9jGd74FE1tdsSOHLupPHPedhlnAnf-Eh_DRTo5hEepL_Q-a9q3fvHGNa0ckPwp5Pbmph6A3w7r7ViYFvFmNj1ZFv2KENNSg7A5zEigde3r1fGGGaRVR5N0w9dS8eIyp6iCFaVPqpfN5ymr7XRIbWDs2dz0MvAqN-ZrzG2gqPoHN1ghppqnv3jLmNUR6UBbM21hbTNxfzb8IFRP8R0JYw',
    role: 'parent',
    following: ['user-admin', 'user-parent-3'],
    childName: 'Léo Dubois',
    username: 'sophie_dubois',
    bio: 'Maman de Léo 🧸 | Créatrice de contenu | Passionnée de cuisine saine pour enfants 🥗',
    website: 'www.bebelien.fr'
  },
  {
    id: 'user-admin',
    name: 'Direction Crèche',
    email: 'admin@petitlien.fr',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWqqKTJzU_6SGZZlh4uDmtKctGql2FiP4Pqx7fQrFcKBUeiDQxM-mvIo6dvp2kZC1VOQ9Hv_4ZCkPKCCCWNueVqYUmHw-lCFXkuiagIFMqv5pRibbrRP2sRu9iamS5Vr0CAVf3yfHfhG0YVKLRC8vgf8YqNYNXDnaa0LAy8oH2YHnhBktjx4qo9tN7Uh6p6TWeWV9mSGMHrvYoeb0GBnPhep6pqEagY4dmfS6QLw1o-ccncNVB8BBOOAcYjtY5By2JzGhYC3QO-1zJ',
    role: 'admin',
    following: [],
    username: 'direction_creche',
    bio: 'Espace officiel de la crèche Petit Lien | Infos, activités et communication avec les parents 🏫',
    website: 'www.petitlien.fr'
  },
  {
    id: 'user-parent-3',
    name: 'Jean Dupont',
    email: 'jean.dupont@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    role: 'parent',
    following: ['user-parent'],
    childName: 'Lucas Dupont',
    username: 'jean_dupont',
    bio: 'Papa de Lucas 🦖 | Coach sportif | Partage de sorties nature et activités en famille 🌲',
    website: 'www.dupontcoach.fr'
  },
  {
    id: 'user-parent-4',
    name: 'Julie Martin',
    email: 'julie.martin@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
    role: 'parent',
    following: [],
    childName: 'Chloé Martin',
    username: 'julie_martin',
    bio: 'Maman de Chloé 🌸 | Artiste peintre | Partage de dessins d\'enfants et ateliers créatifs 🎨'
  }
];

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    authorId: 'user-admin',
    authorName: 'Les Papillons',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-ComdtjVOTixT61_GgPzLpdanX7TiuDRPtpwEgIlSMUAGXneutQGhoxnWhMTDTVmppW3TljZ1-hLByJWH2e0iKg6e24j7T7n7_MFVxjxq0NUcNzLL9ERtz1y8mUYaU1l42aZ1Sgfl3I8JhuX1vchNsoV2Hqo-SNyP98Xqmig-rtQZeEFI9z2vV7RkFv0bnBI_DZjMhVUVulwo8QO53ASZP-ADoxiy_cqfzEGP6z4S4JF_17dmSd8tO9Y2C6rafMpq9F5kxXeROwP',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4WcLEiZCX2m5_i8L57do3BVgURAaJ3AjeQ3-pvQiMvfccOZD-xsrsBXtHL99IGqiOw8in3zFwUcaR-u92haf5VN0GqzU1KcrkP4xNoucAqw4l_EDZKYbNXc2-olR2yaaZ5PZWIYhilZ9Gp9fidfOGqGQa743304GP9DYYOSU6g_DopEqCeowtSd6ub0xAaytszJx485OOAQ4sx1K3lTABUp7NPWZ5CuABa3F7ImbOmLHecHidFcvkp_IjILtQo7Dv_UCIaQp7EEtn',
    time: 'Il y a 10m',
    tag: 'Atelier Sable'
  },
  {
    id: 'story-2',
    authorId: 'user-admin',
    authorName: 'Direction Crèche',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWqqKTJzU_6SGZZlh4uDmtKctGql2FiP4Pqx7fQrFcKBUeiDQxM-mvIo6dvp2kZC1VOQ9Hv_4ZCkPKCCCWNueVqYUmHw-lCFXkuiagIFMqv5pRibbrRP2sRu9iamS5Vr0CAVf3yfHfhG0YVKLRC8vgf8YqNYNXDnaa0LAy8oH2YHnhBktjx4qo9tN7Uh6p6TWeWV9mSGMHrvYoeb0GBnPhep6pqEagY4dmfS6QLw1o-ccncNVB8BBOOAcYjtY5By2JzGhYC3QO-1zJ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVBHofbnLCE5oFDVumxdSAmBEZC3Q1NRpp00vEsZb_VRJuPcmAzyvHoObxZGEDQ8vFIgGItih-WLJwGStJDA-TaCQn41yffTl9UUpohfmmatqFsP15_JPlVF12Cp14xCeC6WpIT83GGdLNI4itp-1jT6eXHcUzgM4LTs3s5_o2PoiJvhFyf4tpjsTNsZMWYk-4uZsPeg6R6SVeced_MEYK0QOIUHsjoHJjDiGixXV-RyE0JBN3ZWgaec3z6Zly7kL3wu7IoNEtMyuM',
    time: 'Il y a 1h',
    tag: 'Sieste'
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-admin',
    authorName: 'Direction Crèche',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWqqKTJzU_6SGZZlh4uDmtKctGql2FiP4Pqx7fQrFcKBUeiDQxM-mvIo6dvp2kZC1VOQ9Hv_4ZCkPKCCCWNueVqYUmHw-lCFXkuiagIFMqv5pRibbrRP2sRu9iamS5Vr0CAVf3yfHfhG0YVKLRC8vgf8YqNYNXDnaa0LAy8oH2YHnhBktjx4qo9tN7Uh6p6TWeWV9mSGMHrvYoeb0GBnPhep6pqEagY4dmfS6QLw1o-ccncNVB8BBOOAcYjtY5By2JzGhYC3QO-1zJ',
    tag: 'Peinture',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASpMltF-d0Omvu6B5GQ5hxm4DjIlmR9-j9cfSEzqAWt2v_xAzdcI9uPC4IBf77gSUEua958altMOpT67pfpv-16JR3uZaCBWR3mcg3mYYrquLaC2HfAtrLHSNQu3eQbFBuoVlRtl2mmIJQa_eJMZLHwvpSGno1UVQAJhiq6qI2VmdNrE3xYDOJKFPqbPtst6yRZyAijha8vAnH0NqulMgDTBxn2WBdLbu3UNlzKiYfZa03f_aeAWBtIJkYPUDB-sCrPjPwfi7vDaX5',
    description: "Aujourd'hui, c'était atelier peinture avec les mains ! Une explosion de couleurs et de sourires pour découvrir les textures. ✨",
    likes: ['user-parent-3'],
    time: 'Il y a 2 heures',
    comments: [
      { id: 'c-1', authorName: 'Jean Dupont', text: 'Lucas a adoré cet atelier ! Merci à vous.', time: '11:15' }
    ]
  },
  {
    id: 'post-2',
    authorId: 'user-admin',
    authorName: 'Les Canailles',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAnvBuATEQKRJw0qMQkanRtzAvffT74YSOCeJq6OTBek4r0Z87eqYlNrjlUpYNgUqVQ6rRWTd-gQyx5xBNvM_6dZxA4THhK-C-sL52ZxzMd9ropZlsqv1V4OboxLXTltNh6o6TC79s_1P1typchY74buWQujjNC3yCQldf33umD-rtBr8a7BY7aXQryKjAA00CDugpMvDdVeN8jIGstdr3NbdGGhnpgcZfYxrPnU0_TWfqEdK9xIbIxs4i-p4S3hh_egi2QyXYyJLa',
    tag: 'Repas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCylISozPAkHcFrKlyyzZv0U7HMvxGziyjN63-7yuBA2fTa0g16Z_HDaqiPwM9YFet1OuWrqebs-ACNffZl7JglYm7bkift1dmeyHah7mvh6Tv_37YMZbl2VeQ2NY7Wn1VXAqOh5ZvzLRYy0s2KTgr6R44BuJWO5tmqdV5JtBCu8tlMXcBAcP1Z9yp1P827lQUtp_LjLXAziXNLZS5X40AIBbmAJr96bsU0O5ZqUikYYWdlXZBl4QV-zsnyynf5eWrEcpg3feH9uagE',
    description: "Au menu ce midi : une petite purée de potiron bio et ses morceaux fondants. Tout le monde s'est régalé ! 🥕🥣",
    likes: ['user-parent'],
    time: 'Il y a 5 heures',
    comments: [
      { id: 'c-2', authorName: 'Sophie Dubois', text: 'Léo en redemande à la maison !', time: '13:00' }
    ]
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-parent', 'user-admin'],
    messages: [
      {
        id: 'm-1',
        senderId: 'user-admin',
        senderName: 'Direction Crèche',
        text: 'Bonjour ! Nous avons bien reçu votre demande pour le changement de régime alimentaire de Léo à partir de lundi.',
        time: '09:12'
      },
      {
        id: 'm-2',
        senderId: 'user-parent',
        senderName: 'Sophie Dubois',
        text: "Super, merci beaucoup. Est-ce qu'il y a des documents supplémentaires à fournir ?",
        time: '09:15'
      },
      {
        id: 'm-3',
        senderId: 'user-admin',
        senderName: 'Direction Crèche',
        text: 'Non, tout est en ordre. La directrice a validé le dossier ce matin. Voici le menu de la semaine prochaine pour vous rassurer.',
        time: '09:18',
        attachment: {
          name: 'Menu_Semaine_Léo.pdf',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmc6SUhVR29_HuR5fmGFmTg016wZnEzLh0ZoUoV1H7JuEe3NFf12j7KTK_TSPST3k38QYF8kOMAhz_zdLqept8JG9QHbEwCrescZ9qEj1OKezvET90q0fYD850DBda-voIo3ukZtyJV1rreuLRjyI3uoydjZKDqshbReqN-cdS0z6RzrXqsm4NZM3MEDR2bbpbPhLEoIxaCEp11PAFAX7pSUCoIIKWPpYC7TGzrsaubGe28vAnFEDU06acSCDoT2IHEw4GwVbqpjyl'
        }
      }
    ]
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-parent',
    text: "L'administration a publié le nouveau menu de la crèche.",
    time: 'Il y a 1h',
    isRead: false,
    type: 'announcement'
  },
  {
    id: 'notif-2',
    userId: 'user-parent',
    text: "Jean Dupont a aimé le commentaire que vous avez laissé.",
    time: 'Il y a 3h',
    isRead: true,
    type: 'like'
  }
];

const INITIAL_CHILD_PROFILE: ChildProfileData = {
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
    },
    {
      name: 'Dubois Marc',
      role: 'Papa',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHG36fsEeq8RC5FVgmMtZunUWrPjmC84n8gkso_SDsDVDj2MdDNfRqx_zJ6yy82jDzDHp61QM_VCkRy-DjjAPcu3dCAhupAOfx2D719rAwBKx9asJe1upxLPoKkatn9lXQ2n2YdmzMHZH0OCQG8c9wBT-9o3-4kmTunEdyn_0gyprShcAutZGf7SxJP4DoYdv6GAKBeoTQnkffN_Ae6QRihznNJTGG4niTVTd_NPyx5kUQrkfzaSv5ZXA4z19AJOa8-_MlvAehaJIk',
      phone: '0600000000'
    }
  ],
  documents: [
    {
      name: 'Dessin_Mai.jpg',
      type: 'image',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7wxb9jOlfmcvMZf6xonUeGnSZ6b58F8j-xv4xk7Pqte1hLCcA1KuzbgUiY86JHb1QDnbWKBtAwpZ5xVM-9-3Ai2vQDw5gpV4NewGJKPQqhPs-6Bve3QfHANxrkqJ5s28y1RZZnD0h4WyIzP7OFsG-RkBdx_icC65QYDDb4MUtIVLPG9KqrFJVlcNu7koCt11LoV0lZCz_0f2l6tusJKVVEtdsSrgtY7AEl3twp5CwKgKaR1S5G09L7TIMDj8OsU7noLyfunuiF29P'
    },
    {
      name: 'Certificat_Med.pdf',
      type: 'pdf'
    }
  ]
};

function App() {
  // Authentication & routing states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'feed' | 'social' | 'messages' | 'profile'>('feed');

  // Core databases
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [childProfile, setChildProfile] = useState<ChildProfileData>(INITIAL_CHILD_PROFILE);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionUser = await supabaseService.getCurrentUserSession();
        if (sessionUser) {
          setCurrentUser(sessionUser);
        } else {
          // If mock mode, seed or load local users
          const allProfiles = await supabaseService.getProfiles();
          if (allProfiles.length === 0 && !supabaseService.isConfigured()) {
            localStorage.setItem('pl_users', JSON.stringify(INITIAL_USERS));
            setUsers(INITIAL_USERS);
          } else {
            setUsers(allProfiles);
          }
        }
      } catch (err) {
        console.error("Session initialization error:", err);
      }
    };
    initSession();
  }, []);

  // Fetch all app data when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setPosts([]);
      setStories([]);
      setConversations([]);
      setNotifications([]);
      return;
    }

    const loadAppData = async () => {
      try {
        const [allProfiles, allPosts, allStories, allConvs, allNotifs] = await Promise.all([
          supabaseService.getProfiles(),
          supabaseService.getPosts(),
          supabaseService.getStories(),
          supabaseService.getConversations(currentUser.id),
          supabaseService.getNotifications(currentUser.id)
        ]);

        setUsers(allProfiles);
        setPosts(allPosts);
        setStories(allStories);
        setConversations(allConvs);
        setNotifications(allNotifs);

        if (currentUser.role === 'parent') {
          const profileData = await supabaseService.getChildProfile(currentUser.id);
          setChildProfile(profileData);
        }
      } catch (err) {
        console.error("Error loading application data:", err);
      }
    };

    loadAppData();
  }, [currentUser]);

  // Synchronize Session & Routing to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pl_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('pl_current_user_id');
      localStorage.removeItem('pl_current_page');
      localStorage.removeItem('pl_active_conv_id');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('pl_current_page', currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('pl_active_conv_id', activeConversationId);
    } else {
      localStorage.removeItem('pl_active_conv_id');
    }
  }, [activeConversationId]);

  // 1. Social Follow / Unfollow Toggler
  const handleToggleFollow = async (targetUserId: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following.includes(targetUserId);
    try {
      await supabaseService.toggleFollow(currentUser.id, targetUserId, isFollowing);
      const updatedUser = await supabaseService.getUserProfile(currentUser.id);
      setCurrentUser(updatedUser);
      const allProfiles = await supabaseService.getProfiles();
      setUsers(allProfiles);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // 2. Chat Navigator / Conversation Starter
  const handleStartChat = async (targetUserId: string) => {
    if (!currentUser) return;
    try {
      const conv = await supabaseService.startConversation(currentUser.id, targetUserId);
      const allConvs = await supabaseService.getConversations(currentUser.id);
      setConversations(allConvs);
      setActiveConversationId(conv.id);
      setCurrentPage('messages');
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  // 3. Post Likes Toggler
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const hasLiked = post.likes.includes(currentUser.id);
    try {
      await supabaseService.toggleLikePost(postId, currentUser.id, hasLiked);
      
      // Send notification to author if liking
      if (!hasLiked && post.authorId !== currentUser.id) {
        await supabaseService.createNotification(
          post.authorId,
          `${currentUser.name} a aimé votre publication "${post.tag}".`,
          'like'
        );
      }
      
      const allPosts = await supabaseService.getPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // 4. Comments Submitter
  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await supabaseService.addComment(postId, currentUser.id, text);
      
      // Send notification to author
      if (post.authorId !== currentUser.id) {
        await supabaseService.createNotification(
          post.authorId,
          `${currentUser.name} a commenté votre publication : "${text.substring(0, 20)}..."`,
          'comment'
        );
      }
      
      const allPosts = await supabaseService.getPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // 5. Publisher of New Posts
  const handleAddPost = async (tag: string, image: string, description: string) => {
    if (!currentUser) return;
    try {
      await supabaseService.createPost(currentUser.id, tag, image, description);
      const allPosts = await supabaseService.getPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  // 6. Publisher of New Stories
  const handleAddStory = async (image: string, tag?: string) => {
    if (!currentUser) return;
    try {
      await supabaseService.createStory(currentUser.id, image, tag);
      const allStories = await supabaseService.getStories();
      setStories(allStories);
    } catch (err) {
      console.error("Error adding story:", err);
    }
  };

  // 7. Message Submitter & Auto-Notifier
  const handleSendMessage = async (conversationId: string, text: string) => {
    if (!currentUser) return;
    const targetConv = conversations.find(c => c.id === conversationId);
    if (!targetConv) return;
    const recipientId = targetConv.participants.find(id => id !== currentUser.id) || '';

    try {
      await supabaseService.sendMessage(conversationId, currentUser.id, text);
      
      if (recipientId) {
        await supabaseService.createNotification(
          recipientId,
          `Nouveau message de ${currentUser.name} : "${text.substring(0, 20)}..."`,
          'message'
        );
      }
      
      const allConvs = await supabaseService.getConversations(currentUser.id);
      setConversations(allConvs);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 8. Registering New User Accounts
  const handleSignup = (newUser: User) => {
    supabaseService.getProfiles().then(setUsers);
  };

  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await supabaseService.markNotificationsAsRead(currentUser.id);
      const allNotifs = await supabaseService.getNotifications(currentUser.id);
      setNotifications(allNotifs);
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await supabaseService.updateProfile(updatedUser);
      setCurrentUser(updatedUser);
      const allProfiles = await supabaseService.getProfiles();
      setUsers(allProfiles);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
      setCurrentPage('feed');
      localStorage.removeItem('pl_current_user_id');
      localStorage.removeItem('pl_current_page');
      localStorage.removeItem('pl_active_conv_id');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const syncProfile = async (newProfile: ChildProfileData) => {
    if (!currentUser) return;
    try {
      await supabaseService.updateChildProfile(currentUser.id, newProfile);
      setChildProfile(newProfile);
    } catch (err) {
      console.error("Error updating child profile:", err);
    }
  };

  // Filter notifications for active logged-in user
  const userNotifications = notifications;

  if (!currentUser) {
    return (
      <Login 
        users={users}
        onLoginSuccess={setCurrentUser} 
        onSignup={handleSignup} 
      />
    );
  }

  return (
    <div className="font-quicksand">
      
      {/* Active screen routing */}
      {currentPage === 'feed' && (
        <Feed
          currentUser={currentUser}
          posts={posts}
          stories={stories}
          notifications={userNotifications}
          onLikePost={handleLikePost}
          onAddComment={handleAddComment}
          onAddPost={handleAddPost}
          onAddStory={handleAddStory}
          onMarkNotificationsRead={handleMarkNotificationsRead}
        />
      )}
      {currentPage === 'social' && (
        <SocialDirectory
          currentUser={currentUser}
          users={users}
          onToggleFollow={handleToggleFollow}
          onStartChat={handleStartChat}
        />
      )}
      {currentPage === 'messages' && (
        <Messages
          currentUser={currentUser}
          users={users}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onSendMessage={handleSendMessage}
          onStartConversation={handleStartChat}
        />
      )}
      {currentPage === 'profile' && (
        <Profile
          currentUser={currentUser}
          users={users}
          posts={posts}
          profile={childProfile}
          onUpdateProfile={syncProfile}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onStartChat={handleStartChat}
        />
      )}

      {/* Shared navigation controls */}
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />

    </div>
  );
}

export default App;
