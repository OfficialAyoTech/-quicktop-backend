CREATE TABLE IF NOT EXISTS wallets (

    id SERIAL PRIMARY KEY,

    user_id VARCHAR(255) UNIQUE NOT NULL,

    balance DECIMAL(15,2) NOT NULL
        DEFAULT 0
        CHECK (balance >= 0),

    currency VARCHAR(10) NOT NULL
        DEFAULT 'NGN',

    status VARCHAR(20) NOT NULL
        DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP

);