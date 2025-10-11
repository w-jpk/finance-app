-- Finance App - Reporting SQL function
-- Usage:
-- SELECT * FROM finance_report('00000000-0000-0000-0000-000000000001', '2024-12-01', '2024-12-31');

CREATE OR REPLACE FUNCTION finance_report(
  p_user_id   uuid,
  p_start     date,
  p_end       date
)
RETURNS TABLE (
  start_date      date,
  end_date        date,
  total_income    numeric,
  total_expenses  numeric,
  balance         numeric,
  category_id     uuid,
  category_name   text,
  amount          numeric,
  percentage      numeric
) AS $$
  WITH filtered AS (
    SELECT t.*
    FROM transactions t
    WHERE t.user_id = p_user_id
      AND t.occurred_on BETWEEN p_start AND p_end
  ),
  income AS (
    SELECT COALESCE(SUM(amount), 0) AS total_income
    FROM filtered WHERE type = 'income'
  ),
  expenses AS (
    SELECT COALESCE(SUM(amount), 0) AS total_expenses
    FROM filtered WHERE type = 'expense'
  ),
  by_category AS (
    SELECT 
      c.id   AS category_id,
      c.name AS category_name,
      SUM(f.amount) AS amount
    FROM filtered f
    JOIN categories c ON c.id = f.category_id
    WHERE f.type = 'expense'
    GROUP BY c.id, c.name
  ),
  tot AS (
    SELECT (SELECT total_income FROM income) AS total_income,
           (SELECT total_expenses FROM expenses) AS total_expenses
  )
  SELECT 
    p_start::date                                   AS start_date,
    p_end::date                                     AS end_date,
    tot.total_income,
    tot.total_expenses,
    (tot.total_income - tot.total_expenses)         AS balance,
    bc.category_id,
    bc.category_name,
    bc.amount,
    CASE WHEN tot.total_expenses > 0 
         THEN (bc.amount / tot.total_expenses) * 100 
         ELSE 0 END                                 AS percentage
  FROM tot
  LEFT JOIN by_category bc ON TRUE
  ORDER BY bc.amount DESC NULLS LAST
$$ LANGUAGE sql STABLE;


