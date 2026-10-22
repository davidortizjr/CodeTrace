CREATE TABLE IF NOT EXISTS tasks (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      text NOT NULL CHECK (length(trim(title)) > 0),
  done       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Starter rows, added only when the table is empty.
INSERT INTO tasks (title)
SELECT t
FROM (VALUES
  ('Read the pg documentation'),
  ('Build the tasks API'),
  ('Connect React to it')
) AS v(t)
WHERE NOT EXISTS (SELECT 1 FROM tasks);
