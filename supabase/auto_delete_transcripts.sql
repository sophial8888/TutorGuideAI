-- Auto-delete session transcripts and chat messages 30 days after a session.
--
-- Keeps: date, duration, subject, topic, student, feelings, tools used, and
-- the reflection report. Clears: speech_transcript and chat_messages.
--
-- Run each step separately in Supabase -> SQL Editor (highlight the step, then Run).
-- Steps 1 and 2 only LOOK at data. Step 3 turns on the daily deletion.


-- STEP 1 (look only): check the columns exist and can be emptied.
-- Expect 3 rows. speech_transcript and chat_messages should say is_nullable = YES.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'sessions'
  and column_name in ('created_at', 'speech_transcript', 'chat_messages');


-- STEP 2 (look only): how many sessions would be cleared right now.
select count(*) as sessions_that_would_be_cleared
from public.sessions
where created_at < now() - interval '30 days'
  and (speech_transcript is not null or chat_messages is not null);


-- STEP 3 (turns it on): schedule a job that runs every day at 03:00 UTC.
-- If "create extension" errors, enable "pg_cron" under
-- Database -> Extensions (or Integrations -> Cron) in the dashboard, then rerun.
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-transcripts',
  '0 3 * * *',
  $$
    update public.sessions
    set speech_transcript = null,
        chat_messages = null
    where created_at < now() - interval '30 days'
      and (speech_transcript is not null or chat_messages is not null);
  $$
);


-- STEP 4 (look only): confirm the job exists, and later, that it ran.
select jobname, schedule, active from cron.job;

select status, start_time, return_message
from cron.job_run_details
order by start_time desc
limit 5;


-- UNDO (turns it off; already-deleted data cannot be recovered):
-- select cron.unschedule('delete-old-transcripts');
