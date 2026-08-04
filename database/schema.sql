-- ============================================
-- AfroItalia Platform - PostgreSQL Schema
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour la géolocalisation avancée

-- ============================================
-- TYPES ENUM
-- ============================================

CREATE TYPE user_role AS ENUM ('USER', 'BUSINESS', 'ADMIN');
CREATE TYPE subscription_tier AS ENUM ('FREE', 'BASIC', 'PREMIUM');
CREATE TYPE business_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- ============================================
-- TABLE: users
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar TEXT,
    role user_role DEFAULT 'USER',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLE: cities
-- ============================================

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_is_active ON cities(is_active);

-- ============================================
-- TABLE: categories
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- TABLE: businesses
-- ============================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_desc VARCHAR(500),

    -- Localisation
    city_id UUID NOT NULL REFERENCES cities(id),
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    zip_code VARCHAR(10),

    -- Catégorie
    category_id UUID NOT NULL REFERENCES categories(id),

    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    whatsapp VARCHAR(20),

    -- Médias
    logo TEXT,
    cover_image TEXT,
    images TEXT[], -- Array de URLs

    -- Horaires (stocké en JSON)
    hours JSONB,

    -- Réseaux sociaux
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    tiktok VARCHAR(255),

    -- Business info
    subscription_tier subscription_tier DEFAULT 'FREE',
    status business_status DEFAULT 'PENDING',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Stats
    view_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,

    -- Abonnement
    subscription_ends_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_city ON businesses(city_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_subscription_tier ON businesses(subscription_tier);
CREATE INDEX idx_businesses_slug ON businesses(slug);

-- Index spatial pour géolocalisation
CREATE INDEX idx_businesses_location ON businesses USING GIST (
    ST_MakePoint(longitude, latitude)::geography
);

-- ============================================
-- TABLE: reviews
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],

    -- Réponse du propriétaire
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Modération
    is_visible BOOLEAN DEFAULT TRUE,
    is_reported BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(business_id, user_id) -- Un user = un avis par business
);

CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- TABLE: favorites
-- ============================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, business_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_business ON favorites(business_id);

-- ============================================
-- TABLE: payments
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    business_id UUID,
    stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- En centimes
    currency VARCHAR(3) DEFAULT 'EUR',
    subscription_tier subscription_tier NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);

-- ============================================
-- FONCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour les stats d'une entreprise après un review
CREATE OR REPLACE FUNCTION update_business_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id AND is_visible = TRUE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id AND is_visible = TRUE)
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_stats_trigger AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_business_stats();

-- Fonction pour mettre à jour favorite_count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE businesses SET favorite_count = favorite_count + 1 WHERE id = NEW.business_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE businesses SET favorite_count = favorite_count - 1 WHERE id = OLD.business_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorite_count_trigger AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_favorite_count();
