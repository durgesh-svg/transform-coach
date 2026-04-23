create table if not exists daily_logs (
  id           uuid        default gen_random_uuid() primary key,
  date         date        not null unique,
  weight_kg    numeric(4,1),
  calories_kcal integer,
  protein_g    integer,
  water_ml     integer,
  steps        integer,
  gym_done     boolean     not null default false,
  gym_notes    text        not null default '',
  skincare_am  boolean     not null default false,
  skincare_pm  boolean     not null default false,
  minoxidil    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- index for date-range queries (progress page)
create index if not exists daily_logs_date_idx on daily_logs (date);

-- RLS: allow all operations (single-user app, no auth needed)
alter table daily_logs enable row level security;

create policy "allow all" on daily_logs
  for all using (true) with check (true);
