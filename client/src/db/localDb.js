import Dexie from 'dexie';

export class VidNoteDB extends Dexie {
  constructor() {
    super('VidNoteDB');
    this.version(1).stores({
      videos: '++id, caption, hashtags, category, duration, synced, createdAt, thumbnailDataUrl',
    });
  }
}

export const db = new VidNoteDB();

export const SEED_VIDEOS = [
  {
    caption: "Mountain sunrise - peaceful morning vibes",
    hashtags: ["#travel", "#nature", "#mountain", "#sunrise"],
    category: "Travel",
    duration: "0:28",
    thumbnailDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%231E293B'/%3E%3Ccircle cx='120' cy='80' r='40' fill='%23F59E0B'/%3E%3Cpath d='M 0 200 L 200 50 L 400 200 Z' fill='%230EA5E9' opacity='0.9'/%3E%3C/svg%3E",
    synced: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    caption: "Golden Retriever playing in the park - so cute!",
    hashtags: ["#dog", "#pet", "#goldenretriever", "#animals"],
    category: "Ideas",
    duration: "0:35",
    thumbnailDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23F1F5F9'/%3E%3Ccircle cx='200' cy='120' r='50' fill='%23D97706'/%3E%3Ccircle cx='170' cy='100' r='8' fill='%231E293B'/%3E%3Ccircle cx='230' cy='100' r='8' fill='%231E293B'/%3E%3C/svg%3E",
    synced: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    caption: "Sunset silhouette at the beach - golden hour",
    hashtags: ["#sunset", "#beach", "#photography", "#goldenhour"],
    category: "Reels",
    duration: "0:42",
    thumbnailDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%237C3AED'/%3E%3Ccircle cx='300' cy='60' r='30' fill='%23F59E0B'/%3E%3Cpath d='M 0 200 Q 200 100 400 200' fill='%231E293B'/%3E%3C/svg%3E",
    synced: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    caption: "Morning coffee routine - latte art practice",
    hashtags: ["#coffee", "#morning", "#cafe", "#latteart"],
    category: "YouTube",
    duration: "0:19",
    thumbnailDataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%2378350F'/%3E%3Ccircle cx='200' cy='120' r='40' fill='%23C026D3' opacity='0.3'/%3E%3Cellipse cx='200' cy='120' rx='40' ry='20' fill='%23FEF08A' opacity='0.8'/%3E%3C/svg%3E",
    synced: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];