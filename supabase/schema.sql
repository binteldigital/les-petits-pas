-- ==========================================
-- SUPABASE SCHEMA FOR PETIT LIEN SOCIAL NETWORK
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Syncs automatically with auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    username text unique,
    email text not null,
    avatar text,
    role text not null check (role in ('parent', 'admin')),
    child_name text,
    bio text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) for Profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
    for select using (true);

create policy "Allow users to update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up via auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar, username, child_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Nouvel Utilisateur'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    new.raw_user_meta_data->>'avatar',
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text from 1 for 8)),
    new.raw_user_meta_data->>'childName'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. FOLLOWS JONCTION TABLE (For parent-parent relationships)
create table public.follows (
    follower_id uuid references public.profiles(id) on delete cascade,
    followed_id uuid references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (follower_id, followed_id)
);

alter table public.follows enable row level security;

create policy "Allow anyone to read followings" on public.follows
    for select using (true);

create policy "Allow logged in users to follow/unfollow" on public.follows
    for all using (auth.uid() = follower_id);


-- 3. POSTS TABLE
create table public.posts (
    id uuid default gen_random_uuid() primary key,
    author_id uuid references public.profiles(id) on delete cascade not null,
    image text not null, -- Base64 or Supabase Storage URL
    tag text,
    tag_color text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

create policy "Allow public read to posts" on public.posts
    for select using (true);

create policy "Allow authenticated users to create posts" on public.posts
    for insert with check (auth.uid() = author_id);

create policy "Allow users to delete their own posts" on public.posts
    for delete using (auth.uid() = author_id);


-- 4. POST LIKES JONCTION TABLE
create table public.post_likes (
    post_id uuid references public.posts(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Allow anyone to see likes" on public.post_likes
    for select using (true);

create policy "Allow authenticated users to toggle likes" on public.post_likes
    for all using (auth.uid() = user_id);


-- 5. POST COMMENTS TABLE
create table public.post_comments (
    id uuid default gen_random_uuid() primary key,
    post_id uuid references public.posts(id) on delete cascade not null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.post_comments enable row level security;

create policy "Allow anyone to view comments" on public.post_comments
    for select using (true);

create policy "Allow authenticated to write comments" on public.post_comments
    for insert with check (auth.uid() = author_id);


-- 6. STORIES TABLE
create table public.stories (
    id uuid default gen_random_uuid() primary key,
    author_id uuid references public.profiles(id) on delete cascade not null,
    media text not null,
    media_type text default 'image' check (media_type in ('image', 'video')),
    target_kids text[], -- Target kids name/groups
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stories enable row level security;

create policy "Allow authenticated read to stories" on public.stories
    for select using (auth.uid() is not null);

create policy "Allow authenticated to publish stories" on public.stories
    for insert with check (auth.uid() = author_id);


-- 7. CONVERSATIONS TABLE
create table public.conversations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;


-- 8. CONVERSATION PARTICIPANTS JONCTION TABLE
create table public.conversation_participants (
    conversation_id uuid references public.conversations(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

-- Policies for Conversations (declared after participants table creation to avoid relation not found error)
create policy "Users can view conversations they are part of" on public.conversations
    for select using (
        exists (
            select 1 from public.conversation_participants
            where conversation_id = id and user_id = auth.uid()
        )
    );

create policy "Users can see participants in their conversations" on public.conversation_participants
    for select using (
        exists (
            select 1 from public.conversation_participants cp
            where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
        )
    );

create policy "Users can insert participants for new conversations" on public.conversation_participants
    for insert with check (auth.uid() = user_id or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ));


-- 9. MESSAGES TABLE
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    text text,
    file_url text,
    file_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can read messages in their conversations" on public.messages
    for select using (
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id and user_id = auth.uid()
        )
    );

create policy "Users can send messages in their conversations" on public.messages
    for insert with check (
        auth.uid() = sender_id and
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id and user_id = auth.uid()
        )
    );


-- 10. NOTIFICATIONS TABLE
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    text text not null,
    is_read boolean default false not null,
    type text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view and update their own notifications" on public.notifications
    for all using (auth.uid() = user_id);


-- 11. CHILD PROFILES TABLE (PAI, Class groups)
create table public.child_profiles (
    id uuid default gen_random_uuid() primary key,
    parent_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    avatar text,
    "group" text not null,
    birthdate text,
    child_id_code text unique,
    allergies text[] default '{}'::text[],
    vaccine_status text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.child_profiles enable row level security;

create policy "Parents can view their own child profiles" on public.child_profiles
    for select using (auth.uid() = parent_id or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ));

create policy "Parents can update their own child profiles" on public.child_profiles
    for update using (auth.uid() = parent_id or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ));


-- 12. CHILD CONTACTS TABLE (Authorized pickup persons)
create table public.child_contacts (
    id uuid default gen_random_uuid() primary key,
    child_profile_id uuid references public.child_profiles(id) on delete cascade not null,
    name text not null,
    role text not null,
    avatar text,
    phone text,
    is_primary boolean default false not null,
    is_occasional boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.child_contacts enable row level security;

create policy "Access to child contacts" on public.child_contacts
    for all using (
        exists (
            select 1 from public.child_profiles cp
            where cp.id = child_profile_id and (cp.parent_id = auth.uid() or exists (
                select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
            ))
        )
    );


-- 13. CHILD DOCUMENTS TABLE (Medical Certs, Drawings)
create table public.child_documents (
    id uuid default gen_random_uuid() primary key,
    child_profile_id uuid references public.child_profiles(id) on delete cascade not null,
    name text not null,
    doc_type text not null, -- 'pdf' | 'image'
    url text, -- File Storage URL
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.child_documents enable row level security;

create policy "Access to child documents" on public.child_documents
    for all using (
        exists (
            select 1 from public.child_profiles cp
            where cp.id = child_profile_id and (cp.parent_id = auth.uid() or exists (
                select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
            ))
        )
    );
