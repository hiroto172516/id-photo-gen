-- 日次売上確認
select
  date_trunc('day', created_at at time zone 'Asia/Tokyo') as day_jst,
  count(*) filter (where status = 'completed') as completed_payments,
  coalesce(sum(amount) filter (where status = 'completed'), 0) as gross_sales_jpy
from public.payments
group by 1
order by 1 desc;

-- 未解決問い合わせ
select
  created_at,
  category,
  status,
  email,
  page_path,
  stripe_session_id
from public.support_inquiries
where status in ('open', 'in_progress')
order by created_at desc;

-- 返金候補: 返金相談 + 決済エラー
select
  created_at,
  category,
  email,
  stripe_session_id,
  stripe_payment_intent_id,
  left(message, 120) as message_preview
from public.support_inquiries
where category in ('payment_error', 'refund_request')
order by created_at desc;
