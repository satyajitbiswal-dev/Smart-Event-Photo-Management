export interface Photo {
    photo_id: string;
    is_private: boolean;
    thumbnail: string;
    title?: string;
    description?: string;
    tags?: string[];
    uploadedAt?: string;
    eventId?: string;
}

export interface MemberProfile {
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