// app/types.ts
export interface Friend {
  id: string;
  name: string;
  height: number;
  weight: number;
  iq?: number;
  gender?: "Erkek" | "Kadın" | "Bilinmiyor";
  charm?: number;
  race?: string;
  interests?: string[];
  photo_url?: string;
}

export interface RawFriend extends Friend {
  friend_interests?: { interests: { name: string } }[];
}
