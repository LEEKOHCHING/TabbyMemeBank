-- ============================================================
-- TABBY MEME BANK - MSSQL Database Schema
-- Run this on your MSSQL instance to initialize the database
-- ============================================================

USE SophiaDB;
GO

-- Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    wallet_address  NVARCHAR(42) NOT NULL UNIQUE,
    nickname        NVARCHAR(100) NULL,
    is_active       BIT DEFAULT 1,
    created_at      DATETIME2 DEFAULT GETDATE(),
    last_login      DATETIME2 NULL
);
GO

-- Fund Investments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fund_investments')
CREATE TABLE fund_investments (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    wallet_address  NVARCHAR(42) NOT NULL,
    amount_bnb      DECIMAL(36,18) NOT NULL,
    amount_tabby    DECIMAL(36,18) NULL,
    tx_hash         NVARCHAR(66) NULL UNIQUE,
    status          NVARCHAR(20) DEFAULT 'pending',
    created_at      DATETIME2 DEFAULT GETDATE(),
    confirmed_at    DATETIME2 NULL
);
CREATE INDEX IX_fund_investments_wallet ON fund_investments(wallet_address);
GO

-- Fund Transactions (Sophia's trading history)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fund_transactions')
CREATE TABLE fund_transactions (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    tx_type         NVARCHAR(50) NOT NULL,
    token_symbol    NVARCHAR(20) NOT NULL,
    token_address   NVARCHAR(42) NULL,
    amount          DECIMAL(36,18) NOT NULL,
    price_usd       DECIMAL(20,8) NULL,
    tx_hash         NVARCHAR(66) NULL,
    description     NVARCHAR(MAX) NULL,
    initiated_by    NVARCHAR(20) DEFAULT 'sophia',
    created_at      DATETIME2 DEFAULT GETDATE()
);
GO

-- Fund Statistics Snapshots
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fund_stats')
CREATE TABLE fund_stats (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    total_invested_bnb      DECIMAL(36,18) DEFAULT 0,
    total_portfolio_value_usd DECIMAL(20,2) DEFAULT 0,
    total_profit_loss_usd   DECIMAL(20,2) DEFAULT 0,
    profit_loss_pct         DECIMAL(10,4) DEFAULT 0,
    cash_available_bnb      DECIMAL(36,18) DEFAULT 0,
    num_investors           INT DEFAULT 0,
    snapshot_at             DATETIME2 DEFAULT GETDATE()
);
GO

-- Insert initial fund stats
IF NOT EXISTS (SELECT * FROM fund_stats)
INSERT INTO fund_stats (total_invested_bnb, total_portfolio_value_usd, total_profit_loss_usd, profit_loss_pct, cash_available_bnb, num_investors)
VALUES (0, 0, 0, 0, 0, 0);
GO

-- Loan Requests (Borrowers)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'loan_requests')
CREATE TABLE loan_requests (
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    borrower_address            NVARCHAR(42) NOT NULL,
    collateral_token_symbol     NVARCHAR(20) NOT NULL,
    collateral_token_address    NVARCHAR(42) NOT NULL,
    collateral_amount           DECIMAL(36,18) NOT NULL,
    loan_amount_bnb             DECIMAL(36,18) NOT NULL,
    loan_duration_days          INT NOT NULL,
    interest_rate_pct           DECIMAL(5,2) NOT NULL,
    collateral_tx_hash          NVARCHAR(66) NULL,
    status                      NVARCHAR(20) DEFAULT 'open',
    created_at                  DATETIME2 DEFAULT GETDATE(),
    expires_at                  DATETIME2 NULL,
    matched_at                  DATETIME2 NULL,
    repaid_at                   DATETIME2 NULL,
    notes                       NVARCHAR(MAX) NULL
);
CREATE INDEX IX_loan_requests_borrower ON loan_requests(borrower_address);
CREATE INDEX IX_loan_requests_status ON loan_requests(status);
GO

-- Loan Offers (Lenders)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'loan_offers')
CREATE TABLE loan_offers (
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    loan_request_id             INT NOT NULL REFERENCES loan_requests(id),
    lender_address              NVARCHAR(42) NOT NULL,
    offered_amount_bnb          DECIMAL(36,18) NOT NULL,
    proposed_interest_rate_pct  DECIMAL(5,2) NULL,
    tx_hash                     NVARCHAR(66) NULL,
    status                      NVARCHAR(20) DEFAULT 'pending',
    created_at                  DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_loan_offers_lender ON loan_offers(lender_address);
GO

-- Loan Contracts (Active loans)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'loan_contracts')
CREATE TABLE loan_contracts (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    loan_request_id         INT NOT NULL REFERENCES loan_requests(id),
    loan_offer_id           INT NOT NULL REFERENCES loan_offers(id),
    borrower_address        NVARCHAR(42) NOT NULL,
    lender_address          NVARCHAR(42) NOT NULL,
    collateral_token_symbol NVARCHAR(20) NOT NULL,
    collateral_token_address NVARCHAR(42) NOT NULL,
    collateral_amount       DECIMAL(36,18) NOT NULL,
    loan_amount_bnb         DECIMAL(36,18) NOT NULL,
    interest_rate_pct       DECIMAL(5,2) NOT NULL,
    loan_duration_days      INT NOT NULL,
    total_repayment_bnb     DECIMAL(36,18) NOT NULL,
    start_date              DATETIME2 DEFAULT GETDATE(),
    due_date                DATETIME2 NOT NULL,
    status                  NVARCHAR(20) DEFAULT 'active',
    repayment_tx_hash       NVARCHAR(66) NULL,
    liquidation_tx_hash     NVARCHAR(66) NULL,
    created_at              DATETIME2 DEFAULT GETDATE()
);
GO

-- Sophia Activities (Live Show feed)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sophia_activities')
CREATE TABLE sophia_activities (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    activity_type   NVARCHAR(50) NOT NULL,
    description     NVARCHAR(MAX) NOT NULL,
    token_symbol    NVARCHAR(20) NULL,
    token_address   NVARCHAR(42) NULL,
    tx_hash         NVARCHAR(66) NULL,
    source_url      NVARCHAR(500) NULL,
    metadata_json   NVARCHAR(MAX) NULL,
    is_visible      BIT DEFAULT 1,
    created_at      DATETIME2 DEFAULT GETDATE()
);
GO

-- Insert some initial Sophia activities for demo
INSERT INTO sophia_activities (activity_type, description, token_symbol) VALUES
('twitter_research', '正在 X 推特上分析 $PEPE 的社区热度和讨论趋势...', 'PEPE'),
('market_scan', '扫描 BSC 链上的新兴 Meme 代币机会，发现了 3 个有潜力的项目', NULL),
('fund_analysis', '更新 TABBY MEME 基金的净值计算，当前持仓表现良好', NULL),
('twitter_research', '查看 KOL 们对 FLOKI 代币的最新评价，社区情绪积极', 'FLOKI'),
('report_published', '发布了 PEPE 代币最新投研报告 - 建议：WATCH', 'PEPE');
GO

-- Sophia Investment Reports
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sophia_reports')
CREATE TABLE sophia_reports (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(200) NOT NULL,
    token_symbol    NVARCHAR(20) NULL,
    token_address   NVARCHAR(42) NULL,
    summary         NVARCHAR(MAX) NOT NULL,
    full_report     NVARCHAR(MAX) NOT NULL,
    recommendation  NVARCHAR(20) NULL,
    risk_level      NVARCHAR(10) NULL,
    confidence_score INT NULL,
    sources_json    NVARCHAR(MAX) NULL,
    is_published    BIT DEFAULT 1,
    published_at    DATETIME2 DEFAULT GETDATE(),
    created_at      DATETIME2 DEFAULT GETDATE()
);
GO

-- Insert demo report
INSERT INTO sophia_reports (title, token_symbol, summary, full_report, recommendation, risk_level, confidence_score)
VALUES (
    'PEPE 代币深度投研报告 - 2026 Q2',
    'PEPE',
    'PEPE 是目前 BSC 链上市值最大的 Meme 代币之一。根据链上数据和社交媒体分析，PEPE 目前处于盘整阶段，社区活跃度较高。建议小仓位观望，等待突破信号。',
    '## PEPE 代币深度分析

### 基本面分析
PEPE 作为经典 Meme 代币，拥有强大的社区基础和广泛的品牌认知度。

### 技术分析
- 当前价格区间：$0.000008 - $0.000012
- 支撑位：$0.000007
- 阻力位：$0.000015

### 链上数据
- 持有人数：450,000+
- 24h 交易量：$45M
- 市值：$3.5B

### 风险评估
Meme 代币本质上具有极高的投机性，价格受市场情绪影响显著。

### 结论
短期谨慎，中期可小仓位布局。',
    'WATCH',
    'HIGH',
    65
);
GO

-- Chat Messages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_messages')
CREATE TABLE chat_messages (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    session_id      NVARCHAR(100) NOT NULL,
    wallet_address  NVARCHAR(42) NULL,
    role            NVARCHAR(10) NOT NULL,
    content         NVARCHAR(MAX) NOT NULL,
    created_at      DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_chat_messages_session ON chat_messages(session_id);
GO

PRINT 'TABBY MEME BANK database schema initialized successfully!';
GO
