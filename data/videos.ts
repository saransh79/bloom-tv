import type { Video } from "@/types/video";
const youtube = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const videos: Video[] = [
  {
    id: "v1",
    slug: "diwali-patakhe-competition",
    title: {
      en: "Diwali patakhe competition",
      hi: "दिवाली पटाखों की प्रतियोगिता",
    },
    summary: {
      en: "Watch the latest story in the Bloom library.",
      hi: "ब्लूम लाइब्रेरी की नई कहानी देखें।",
    },
    topic: "family",
    spokenLanguage: "hi",
    durationSeconds: 562,
    thumbnailUrl:
      "https://res.cloudinary.com/djbxurukv/video/upload/so_5,w_1280,h_720,c_fill/v1793642821/videos/video1.jpg",
    videoUrl:
      "https://res.cloudinary.com/djbxurukv/video/upload/v1793642821/videos/video1.mp4",
    ageGuidance: "Review before children watch",
    featured: true,
    published: true,
  },
  {
    id: "v6",
    slug: "sasural-ke-rishte",
    title: {
      en: "Family relationships: A Hindi story",
      hi: "ससुराल के रिश्ते — एक हिन्दी कहानी",
    },
    summary: {
      en: "A Hindi family story from Gyan Vichar Kahani.",
      hi: "ज्ञान विचार कहानी की एक हिन्दी पारिवारिक कहानी।",
    },
    topic: "family",
    spokenLanguage: "hi",
    durationSeconds: 0,
    thumbnailUrl: youtube("VX9gMj51Y4w"),
    youtubeId: "VX9gMj51Y4w",
    previewYoutubeId: "VX9gMj51Y4w",
    ageGuidance: "Review before children watch",
    featured: false,
    published: true,
  },
  {
    id: "v3",
    slug: "emotions",
    title: { en: "Understanding your feelings", hi: "अपनी भावनाओं को समझें" },
    summary: {
      en: "Name common feelings and learn ways to talk about them.",
      hi: "भावनाओं को पहचानें और उनके बारे में बात करना सीखें।",
    },
    topic: "learning",
    spokenLanguage: "en",
    durationSeconds: 220,
    thumbnailUrl: youtube("dOkyKyVFnSs"),
    youtubeId: "dOkyKyVFnSs",
    previewYoutubeId: "dOkyKyVFnSs",
    ageGuidance: "All ages",
    featured: false,
    published: true,
  },
  {
    id: "v5",
    slug: "kindness",
    title: { en: "Choosing kindness every day", hi: "हर दिन दयालुता चुनें" },
    summary: {
      en: "Everyday ways to care for people around us.",
      hi: "अपने आसपास के लोगों का ध्यान रखने के सरल तरीके।",
    },
    topic: "family",
    spokenLanguage: "en",
    durationSeconds: 195,
    thumbnailUrl: youtube("kAo4-2UzgPo"),
    youtubeId: "kAo4-2UzgPo",
    previewYoutubeId: "kAo4-2UzgPo",
    ageGuidance: "All ages",
    featured: false,
    published: true,
  },
];
