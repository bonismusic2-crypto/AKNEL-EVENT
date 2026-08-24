export const SAMPLE_DATA = {
  user: {
    name: 'Bonis',
    phone: '+225 07 12 34 56 78',
    email: 'bonis@example.com',
    isVip: true,
    plan: 'Premium VIP',
    renewalDate: '24 Septembre 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  },
  heroBanner: {
    badge: 'NOUVEAU CLIP',
    title: 'Jésus règne à jamais',
    artist: 'Chantre Boniface',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  audioReleases: [
    {
      id: 1,
      title: 'ÉLÉVATION',
      year: '2026',
      type: 'album',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      artist: 'Chantre Boniface',
      tracks: [
        { id: 101, title: 'Élévation', duration: '04:25', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', liked: true },
        { id: 102, title: 'Ton amour est fidèle', duration: '05:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', liked: false },
        { id: 103, title: 'Grâce infinie', duration: '04:50', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', liked: true },
        { id: 104, title: 'Oui tu es Dieu', duration: '06:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', liked: false },
        { id: 105, title: "Je t'adore", duration: '04:18', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', liked: false },
      ]
    },
    {
      id: 2,
      title: 'TOUT POUR TOI',
      year: '2026',
      type: 'album',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
      artist: 'Chantre Boniface',
      tracks: [
        { id: 201, title: 'Tout pour toi', duration: '04:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', liked: true },
        { id: 202, title: 'Saint Esprit viens', duration: '05:30', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', liked: false }
      ]
    },
    {
      id: 3,
      title: 'JÉSUS RÈGNE',
      year: '2026',
      type: 'single',
      cover: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
      artist: 'Chantre Boniface',
      tracks: [
        { id: 301, title: 'Jésus règne', duration: '05:15', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', liked: true }
      ]
    },
    {
      id: 4,
      title: 'VICTOIRE',
      year: '2026',
      type: 'single',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
      artist: 'Chantre Boniface',
      tracks: [
        { id: 401, title: 'Victoire', duration: '04:55', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', liked: true }
      ]
    },
    {
      id: 5,
      title: 'MON SECOURS',
      year: '2025',
      type: 'single',
      cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500',
      artist: 'Chantre Boniface',
      tracks: []
    },
    {
      id: 6,
      title: 'ALLÉLUIA',
      year: '2025',
      type: 'album',
      cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500',
      artist: 'Chantre Boniface',
      tracks: []
    }
  ],
  videoClips: [
    {
      id: 1,
      title: 'Jésus règne à jamais',
      date: '12 août 2026',
      views: '12K vues',
      duration: '05:12',
      thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=600',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Tu es fidèle',
      date: '2 août 2026',
      views: '8K vues',
      duration: '04:45',
      thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: "Mon cœur t'appartient",
      date: '20 juil. 2026',
      views: '15K vues',
      duration: '04:30',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ],
  teachings: [
    {
      id: 1,
      title: 'La puissance de la louange prophétique',
      type: 'audio',
      duration: '45 min',
      category: 'Audio',
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
    },
    {
      id: 2,
      title: 'Marcher dans la présence de Dieu',
      type: 'video',
      duration: '1h 12 min',
      category: 'Vidéo',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 3,
      title: "Comprendre l'adoration",
      type: 'audio',
      duration: '32 min',
      category: 'Audio',
      thumbnail: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'
    },
    {
      id: 4,
      title: 'Le combat spirituel',
      type: 'video',
      duration: '58 min',
      category: 'Vidéo',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 5,
      title: 'La foi qui déplace les montagnes',
      type: 'audio',
      duration: '40 min',
      category: 'Audio',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
    }
  ]
};
