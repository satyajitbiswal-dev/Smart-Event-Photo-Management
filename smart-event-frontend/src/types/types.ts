export interface Photo {
    photo_id: string;
    is_private: boolean;
    thumbnail: string;
    title?: string;
    description?: string;
    tags?: string[];
    uploadedAt?: string;
    eventId?: string;
    photo?: string;
    // watermarked_image?: string;
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
    id:number;
    text_message : string;
    send_time : string;
    is_seen : boolean;
    type : string;
    photo_id ?: string;
    comment_id ?: string
    event_id ?: string;
}