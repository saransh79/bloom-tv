export type Language = "en" | "hi";
export type Topic = "wellness" | "learning" | "family";
export type Video = {
  id: string;
  slug: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  topic: Topic;
  spokenLanguage: Language;
  durationSeconds: number;
  thumbnailUrl: string;
  localUrl?: string;
  youtubeId?: string;
  previewYoutubeId?: string;
  ageGuidance: string;
  featured: boolean;
  published: boolean;
};
