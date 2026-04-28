# The Data Trust Framework

**A four-pillar SQL system that makes every metric auditable, reliable, and trusted.**

> "Data is only as valuable as the trust behind it."

---

## The Problem

Every organization has a version of this story. A weekly business review grinds to a halt because Finance and Product are showing different numbers for the same metric. Nobody is lying. The numbers are technically accurate. But they are measuring different things under the same name — and nobody wrote that down.

This is not a technology problem. It is a systems problem. When definitions are undocumented, lineage is invisible, quality is assumed, and there is no explicit agreement between who produces data and who consumes it, trust collapses. Quietly, repeatedly, at the worst moments.

**The core premise:** A number is only trustworthy when you can answer four questions about it:
- Who approved what it means?
- Where exactly did it come from?
- Did it pass quality checks before landing here?
- Who made a formal commitment to deliver it reliably?

The Data Trust Framework embeds those four answers directly into the data warehouse as first-class SQL objects — making trust visible, measurable, and auditable without requiring a new platform or a separate tool.

---

## The Four Pillars

Each pillar addresses a specific failure mode that allows bad data to go undetected. Together, they produce a trust score from 0 to 100 for every metric in your warehouse.

| # | Pillar | What it solves | SQL table |
|---|--------|---------------|-----------|
| 1 | **Define** | Undocumented, ambiguous metric definitions | `metric_registry` |
| 2 | **Trace** | Unknown data origins and transformation logic | `data_lineage` |
| 3 | **Test** | Undetected quality failures entering reports | `quality_rules` + `quality_check_log` |
| 4 | **Contract** | Missing SLAs between data producers and consumers | `data_contracts` |

---

## SQL Schema

### Pillar 1 · Define — `metric_registry`

Every metric must be defined and approved before it can be trusted. No number enters a report while `status = 'draft'`.

```sql
CREATE TABLE metric_registry (
    metric_id     SERIAL       PRIMARY KEY,
    metric_name   VARCHAR(100) NOT NULL UNIQUE,
    category      VARCHAR(50),
    business_def  TEXT         NOT NULL,  -- plain-English, no jargon
    technical_def TEXT         NOT NULL,  -- exact SQL formula or expression
    owner_team    VARCHAR(100) NOT NULL,
    approved_by   VARCHAR(100),           -- NULL = not yet approved
    approved_at   TIMESTAMP,
    version       INT          DEFAULT 1,
    status        VARCHAR(20)  DEFAULT 'draft'
    -- status: draft | active | deprecated
);
```

### Pillar 2 · Trace — `data_lineage`

Documents the full journey from raw source to reported number. One row per metric per source system.

```sql
CREATE TABLE data_lineage (
    lineage_id         SERIAL       PRIMARY KEY,
    metric_id          INT          REFERENCES metric_registry(metric_id),
    source_system      VARCHAR(100) NOT NULL,   -- e.g. Stripe, Salesforce, dbt
    source_table       VARCHAR(200) NOT NULL,
    transformation_sql TEXT,                    -- how raw data becomes the metric
    pipeline_name      VARCHAR(100),
    refresh_frequency  VARCHAR(50),             -- realtime | hourly | daily | weekly
    last_refreshed_at  TIMESTAMP,
    maintained_by      VARCHAR(100)
);
```

### Pillar 3 · Test — `quality_rules` & `quality_check_log`

Rules that must pass on every refresh before a metric is trusted. `check_sql` returns rows if the rule is violated.

```sql
CREATE TABLE quality_rules (
    rule_id          SERIAL       PRIMARY KEY,
    metric_id        INT          REFERENCES metric_registry(metric_id),
    rule_name        VARCHAR(100) NOT NULL,
    rule_description TEXT         NOT NULL,
    check_sql        TEXT         NOT NULL,  -- returns rows = violation detected
    severity         VARCHAR(20)  DEFAULT 'warning'
    -- severity: critical | warning | info
);

-- Append-only log of every quality check run by your pipeline.
CREATE TABLE quality_check_log (
    log_id       SERIAL    PRIMARY KEY,
    rule_id      INT       REFERENCES quality_rules(rule_id),
    checked_at   TIMESTAMP DEFAULT NOW(),
    rows_failed  INT       DEFAULT 0,   -- 0 = rule passed
    passed       BOOLEAN,               -- set to (rows_failed = 0) on insert
    details      TEXT
);
```

### Pillar 4 · Contract — `data_contracts`

Explicit, signed SLA between the team that produces a metric and the team that depends on it.

```sql
CREATE TABLE data_contracts (
    contract_id       SERIAL         PRIMARY KEY,
    metric_id         INT            REFERENCES metric_registry(metric_id),
    producer_team     VARCHAR(100)   NOT NULL,
    consumer_team     VARCHAR(100)   NOT NULL,
    freshness_sla_hrs INT            NOT NULL,  -- max acceptable hours stale
    completeness_sla  DECIMAL(5,2)   NOT NULL,  -- min % of non-null values
    signed_at         TIMESTAMP      DEFAULT NOW(),
    active            BOOLEAN        DEFAULT TRUE
);
```

---

## Sample Dataset

**Scenario:** A SaaS company tracks three common business metrics at different stages of governance maturity.

### `metric_registry`

```sql
INSERT INTO metric_registry
  (metric_name, category, business_def, technical_def, owner_team, approved_by, approved_at, status)
VALUES
  -- Fully governed. Ready to trust.
  (
    'monthly_recurring_revenue',
    'finance',
    'Total contracted recurring revenue normalized to a monthly value,
     excluding one-time charges, discounts, and trial periods.',
    'SUM(subscription_amount) WHERE billing_cycle = ''monthly''
     AND status = ''active'' AND trial = FALSE',
    'Finance',
    'Head of Finance',
    '2025-01-15 09:00:00',
    'active'
  ),
  -- Approved and active, but missing a contract.
  (
    'customer_churn_rate',
    'product',
    'Percentage of customers who cancelled their subscription
     in a given calendar month, measured at the cohort level.',
    '(customers_cancelled_in_month / customers_at_month_start) * 100.0',
    'Product Analytics',
    'VP of Product',
    '2025-02-01 11:00:00',
    'active'
  ),
  -- Not yet approved. No lineage, no tests, no contract.
  (
    'daily_active_users',
    'product',
    'Count of unique users who performed at least one meaningful action
     in the product on a given calendar day.',
    'COUNT(DISTINCT user_id) WHERE event_date = CURRENT_DATE
     AND event_type NOT IN (''ping'', ''heartbeat'')',
    'Engineering',
    NULL,    -- not yet approved
    NULL,
    'draft'  -- still a draft
  );
```

### `data_lineage`

```sql
INSERT INTO data_lineage
  (metric_id, source_system, source_table, transformation_sql,
   pipeline_name, refresh_frequency, maintained_by)
VALUES
  (
    1,  -- monthly_recurring_revenue
    'Stripe',
    'stripe.subscriptions',
    'SELECT SUM(plan_amount / 100.0)
     FROM stripe.subscriptions
     WHERE status = ''active''
       AND billing_scheme = ''per_unit''
       AND trial_end IS NULL',
    'stripe_mrr_daily',
    'daily',
    'Data Engineering'
  ),
  (
    2,  -- customer_churn_rate
    'Internal CRM',
    'crm.subscription_events',
    'SELECT
       (COUNT(*) FILTER (WHERE event = ''cancelled'') * 100.0)
       / NULLIF(COUNT(DISTINCT customer_id), 0)
     FROM crm.subscription_events
     WHERE event_month = DATE_TRUNC(''month'', NOW())',
    'churn_rate_daily',
    'daily',
    'Data Engineering'
  );
-- Note: daily_active_users has no lineage row — Pillar 2 is missing.
```

### `quality_rules`

```sql
INSERT INTO quality_rules
  (metric_id, rule_name, rule_description, check_sql, severity)
VALUES
  (
    1,  -- monthly_recurring_revenue
    'mrr_no_nulls',
    'MRR must never be NULL for active reporting periods.',
    'SELECT * FROM finance.mrr_daily
     WHERE mrr_amount IS NULL
       AND report_date >= CURRENT_DATE - INTERVAL ''30 days''',
    'critical'
  ),
  (
    1,  -- monthly_recurring_revenue
    'mrr_positive_value',
    'MRR must be a positive number. Zero or negative values indicate a pipeline error.',
    'SELECT * FROM finance.mrr_daily WHERE mrr_amount <= 0',
    'critical'
  ),
  (
    2,  -- customer_churn_rate
    'churn_rate_valid_range',
    'Churn rate must be between 0% and 100%. Any value outside this range is a data error.',
    'SELECT * FROM product.churn_monthly
     WHERE churn_rate < 0 OR churn_rate > 100',
    'critical'
  );
-- Note: daily_active_users has no quality rules — Pillar 3 is missing.
```

### `data_contracts`

```sql
INSERT INTO data_contracts
  (metric_id, producer_team, consumer_team,
   freshness_sla_hrs, completeness_sla, signed_at)
VALUES
  (
    1,  -- monthly_recurring_revenue
    'Finance',
    'Executive Team',
    24,    -- must refresh within 24 hours
    99.9,  -- 99.9% of rows must be non-null
    '2025-01-20 10:00:00'
  );
-- Note: customer_churn_rate and daily_active_users have no contracts — Pillar 4 is missing.
```

---

## The Trust Score View

```sql
CREATE VIEW metric_trust_scores AS
SELECT
    mr.metric_name,
    mr.category,
    mr.owner_team,
    mr.status,

    -- Pillar 1: Definition approved and active?
    CASE WHEN mr.approved_by IS NOT NULL AND mr.status = 'active'
         THEN 'yes' ELSE 'no' END                   AS defined,

    -- Pillar 2: Lineage documented?
    CASE WHEN dl.lineage_id IS NOT NULL
         THEN 'yes' ELSE 'no' END                   AS traced,

    -- Pillar 3: Quality rules exist?
    CASE WHEN COALESCE(qr.rule_count, 0) > 0
         THEN 'yes' ELSE 'no' END                   AS tested,

    -- Pillar 4: Active contract in place?
    CASE WHEN dc.contract_id IS NOT NULL
         THEN 'yes' ELSE 'no' END                   AS contracted,

    -- Trust score: 25 points per pillar (max 100)
    (
        CASE WHEN mr.approved_by IS NOT NULL
                  AND mr.status = 'active'           THEN 25 ELSE 0 END
      + CASE WHEN dl.lineage_id IS NOT NULL          THEN 25 ELSE 0 END
      + CASE WHEN COALESCE(qr.rule_count, 0) > 0    THEN 25 ELSE 0 END
      + CASE WHEN dc.contract_id IS NOT NULL         THEN 25 ELSE 0 END
    )                                                AS trust_score

FROM metric_registry mr
LEFT JOIN data_lineage dl
    ON mr.metric_id = dl.metric_id
LEFT JOIN (
    SELECT metric_id, COUNT(*) AS rule_count
    FROM quality_rules
    GROUP BY metric_id
) qr ON mr.metric_id = qr.metric_id
LEFT JOIN data_contracts dc
    ON mr.metric_id = dc.metric_id AND dc.active = TRUE;


-- Run it:
SELECT * FROM metric_trust_scores ORDER BY trust_score DESC;
```

### Expected output (sample dataset)

| metric_name | defined | traced | tested | contracted | trust_score |
|---|---|---|---|---|---|
| monthly_recurring_revenue | yes | yes | yes | yes | **100** |
| customer_churn_rate | yes | yes | yes | no | **75** |
| daily_active_users | no | no | no | no | **0** |

A score of 75 on churn rate does not mean the data is wrong — it means there is no formal commitment from a producing team to deliver it reliably. The framework turns that gap from an unknown risk into a visible, actionable task.

---

## Extending the Framework

The core schema is intentionally minimal. It scales in three directions without structural changes:

1. **Automate quality runs** — Wire `quality_check_log` into your dbt test suite, Airflow DAG, or GitHub Actions pipeline. Every refresh writes a row. Dashboards reflect real-time pass/fail status without a separate observability tool.

2. **Alert on score drops** — Schedule a query that sends a page when any metric's `trust_score` falls below a threshold. A metric that was trusted yesterday and isn't today is a signal — not background noise.

3. **Publish the registry** — Export `metric_registry` to any data catalog (Notion, Confluence, static site). Making definitions searchable is a forcing function for keeping them current and debated.

---

*Geoffrey Rugarabamu · Data Governance & Analytics · [rugarabamu.me](https://rugarabamu.me)*
