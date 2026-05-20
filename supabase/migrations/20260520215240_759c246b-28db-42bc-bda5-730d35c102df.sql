
CREATE TABLE public.panic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.panic_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create panic alerts"
  ON public.panic_alerts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
