from sqlalchemy import Column, String, DateTime, Numeric, Integer, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class FundInvestment(Base):
    __tablename__ = "fund_investments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String(42), nullable=False, index=True)
    amount_bnb = Column(Numeric(36, 18), nullable=False)
    amount_tabby = Column(Numeric(36, 18), nullable=True)
    tx_hash = Column(String(66), unique=True, nullable=True)
    status = Column(String(20), default="pending")  # pending, confirmed, failed
    created_at = Column(DateTime, server_default=func.now())
    confirmed_at = Column(DateTime, nullable=True)


class FundTransaction(Base):
    __tablename__ = "fund_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tx_type = Column(String(50), nullable=False)  # buy, sell, add_liquidity, remove_liquidity
    token_symbol = Column(String(20), nullable=False)
    token_address = Column(String(42), nullable=True)
    amount = Column(Numeric(36, 18), nullable=False)
    price_usd = Column(Numeric(20, 8), nullable=True)
    tx_hash = Column(String(66), nullable=True)
    description = Column(Text, nullable=True)
    initiated_by = Column(String(20), default="sophia")  # sophia or manual
    created_at = Column(DateTime, server_default=func.now())


class FundStats(Base):
    __tablename__ = "fund_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    total_invested_bnb = Column(Numeric(36, 18), default=0)
    total_portfolio_value_usd = Column(Numeric(20, 2), default=0)
    total_profit_loss_usd = Column(Numeric(20, 2), default=0)
    profit_loss_pct = Column(Numeric(10, 4), default=0)
    cash_available_bnb = Column(Numeric(36, 18), default=0)
    num_investors = Column(Integer, default=0)
    snapshot_at = Column(DateTime, server_default=func.now())
