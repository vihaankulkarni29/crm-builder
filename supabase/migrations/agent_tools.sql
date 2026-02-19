-- Create table for managing Agent Tools
create table if not exists agent_tools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  masked_secret text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table agent_tools enable row level security;

-- Create policy to allow full access to authenticated users (admins)
create policy "Allow full access to authenticated users"
  on agent_tools for all
  to authenticated
  using (true);
