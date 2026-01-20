-- Schema Supabase pour KDP Tracker

-- Table: kdp_cookies (stocke les cookies utilisateurs)
CREATE TABLE kdp_cookies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  cookies JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, marketplace)
);

-- Table: kdp_sales (toutes les ventes)
CREATE TABLE kdp_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  book_title TEXT NOT NULL,
  asin TEXT,
  units_sold INTEGER DEFAULT 0,
  kenp_reads INTEGER DEFAULT 0,
  royalty DECIMAL(10,2) DEFAULT 0,
  sale_date DATE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_kdp_sales_user ON kdp_sales(user_id);
CREATE INDEX idx_kdp_sales_date ON kdp_sales(sale_date DESC);
CREATE INDEX idx_kdp_sales_user_date ON kdp_sales(user_id, sale_date DESC);

-- Table: kdp_summary (résumé par marketplace)
CREATE TABLE kdp_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  total_sales INTEGER DEFAULT 0,
  total_royalties DECIMAL(10,2) DEFAULT 0,
  total_kenp INTEGER DEFAULT 0,
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, marketplace)
);

-- Table: kdp_books (livres trackés)
CREATE TABLE kdp_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asin TEXT NOT NULL,
  title TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  format TEXT, -- ebook, paperback, hardcover
  current_bsr INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, asin, marketplace)
);

-- Row Level Security (RLS)
ALTER TABLE kdp_cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kdp_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kdp_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE kdp_books ENABLE ROW LEVEL SECURITY;

-- Policies: Les utilisateurs ne voient que leurs données
CREATE POLICY "Users can view own cookies" ON kdp_cookies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cookies" ON kdp_cookies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cookies" ON kdp_cookies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sales" ON kdp_sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own summary" ON kdp_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own books" ON kdp_books
  FOR SELECT USING (auth.uid() = user_id);

-- Service role peut tout faire (pour le backend)
CREATE POLICY "Service role can manage all" ON kdp_cookies
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage sales" ON kdp_sales
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage summary" ON kdp_summary
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage books" ON kdp_books
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
