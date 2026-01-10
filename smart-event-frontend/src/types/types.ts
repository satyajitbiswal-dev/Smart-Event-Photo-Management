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

export interface MemberProfileForm {
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
export type MemberProfile = Partial<MemberProfileForm>;

export interface Event {
    id : string
    event_coordinator : string
    event_photographer : string
    event_members : string
    event_name : string
    description : string
    event_date : string
    event_time : string
    qr_code : string
    slug : string ;
}