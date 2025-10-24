-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'buyer');

-- Create crop_category enum
CREATE TYPE public.crop_category AS ENUM ('grains', 'vegetables', 'fruits', 'pulses', 'spices', 'others');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  taluk TEXT,
  district TEXT,
  state TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (secure role management)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_name TEXT NOT NULL,
  category crop_category NOT NULL,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  price_per_kg NUMERIC NOT NULL CHECK (price_per_kg > 0),
  description TEXT,
  location_village TEXT NOT NULL,
  location_taluk TEXT,
  location_district TEXT NOT NULL,
  location_state TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transportation_requests table
CREATE TABLE public.transportation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  tracking_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create price_predictions table
CREATE TABLE public.price_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  category crop_category NOT NULL,
  location_state TEXT NOT NULL,
  season TEXT NOT NULL,
  predicted_price_per_kg NUMERIC NOT NULL,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crops
CREATE POLICY "Crops are viewable by everyone"
  ON public.crops FOR SELECT
  USING (true);

CREATE POLICY "Farmers can create crops"
  ON public.crops FOR INSERT
  WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));

CREATE POLICY "Farmers can update own crops"
  ON public.crops FOR UPDATE
  USING (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));

CREATE POLICY "Farmers can delete own crops"
  ON public.crops FOR DELETE
  USING (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));

-- RLS Policies for transportation_requests
CREATE POLICY "Transport requests viewable by involved parties"
  ON public.transportation_requests FOR SELECT
  USING (auth.uid() = farmer_id OR auth.uid() = buyer_id);

CREATE POLICY "Farmers can create transport requests"
  ON public.transportation_requests FOR INSERT
  WITH CHECK (auth.uid() = farmer_id AND public.has_role(auth.uid(), 'farmer'));

CREATE POLICY "Involved parties can update transport requests"
  ON public.transportation_requests FOR UPDATE
  USING (auth.uid() = farmer_id OR auth.uid() = buyer_id);

-- RLS Policies for price_predictions
CREATE POLICY "Price predictions viewable by everyone"
  ON public.price_predictions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create price predictions"
  ON public.price_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ratings
CREATE POLICY "Ratings viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Buyers can create ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id AND public.has_role(auth.uid(), 'buyer'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_crops
  BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_transportation
  BEFORE UPDATE ON public.transportation_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_crops_farmer_id ON public.crops(farmer_id);
CREATE INDEX idx_crops_category ON public.crops(category);
CREATE INDEX idx_crops_available ON public.crops(available);
CREATE INDEX idx_crops_location ON public.crops(location_state, location_district);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_transportation_farmer_id ON public.transportation_requests(farmer_id);
CREATE INDEX idx_transportation_buyer_id ON public.transportation_requests(buyer_id);
CREATE INDEX idx_ratings_farmer_id ON public.ratings(farmer_id);