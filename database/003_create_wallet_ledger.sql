CREATE TABLE IF NOT EXISTS wallet_ledger (

    id SERIAL PRIMARY KEY,

    wallet_id INTEGER NOT NULL
        REFERENCES wallets(id)
        ON DELETE CASCADE,

    reference VARCHAR(100) NOT NULL
        UNIQUE,

    type VARCHAR(20) NOT NULL
        CHECK (type IN ('credit', 'debit')),

    source VARCHAR(50) NOT NULL,

    service VARCHAR(50),

    amount DECIMAL(15,2) NOT NULL
        CHECK (amount > 0),

    balance_before DECIMAL(15,2) NOT NULL,

    balance_after DECIMAL(15,2) NOT NULL,

    description TEXT,

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'successful', 'failed', 'reversed')),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_id
ON wallet_ledger(wallet_id);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created_at
ON wallet_ledger(created_at);