
export type PhotoEventSummary = {
  id: string;
  event_name: string;
  event_photographer: string;
  event_date: string;
};

export type PhotoEXIF = {
  gps_latitude?: number;
  gps_longitude?: number;
  camera_model?: string;
  aperture?: string;
  shutter_speed?: string;
}


export interface Photo {
  photo_id: string;
  is_private: boolean;
  thumbnail: string;
  image_url?: string;

  upload_time_stamp?: string;
  taken_at?: string;
  exifData?: PhotoEXIF

  tag: string[];
  tagged_user: string[];
  liked_users: string[];
  is_favourite_of: string[];
  event: string | null;
  like_count: number;
}


export interface PhotoListItem {
  photo_id: string;
  is_private: boolean;
  thumbnail: string;
}


export interface User {
  email: string;
  username: string;
  name: string;
  role: string;
  enrollment?: string;
  profile_pic?: string;
  batch?: string;
  department?: string;
  bio?: string;
  sex?: string;
  dob?: string;
}

export type MemberProfile = Partial<User>;

export interface Event {
  id: string
  event_coordinator: string
  event_photographer: string
  event_members: string[]
  event_name: string
  description: string
  event_date: string
  event_time: string
  qr_code: string
  slug: string;
}
export interface Notification {
  id: number;
  text_message: string;
  send_time: string;
  is_seen: boolean;
  type: string;
  photo_id?: string;
  comment_id?: string
  event_id?: string;
}

export type Comment = {
  id: string,
  photo: string,
  parent_comment: string,
  user: PhotoTaggedUser,
  body: string,
  created: string
}