from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean
from sqlalchemy.sql import func
from app.database import Base


class SophiaActivity(Base):
    """Live feed of what Sophia is doing."""
    __tablename__ = "sophia_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    activity_type = Column(String(50), nullable=False)
    # Types: twitter_research, token_buy, token_sell, add_liquidity,
    #        remove_liquidity, fund_analysis, market_scan, report_published
    description = Column(Text, nullable=False)
    token_symbol = Column(String(20), nullable=True)
    token_address = Column(String(42), nullable=True)
    tx_hash = Column(String(66), nullable=True)
    source_url = Column(String(500), nullable=True)
    metadata_json = Column(Text, nullable=True)
    is_visible = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class SophiaReport(Base):
    """Investment research reports published by Sophia."""
    __tablename__ = "sophia_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    token_symbol = Column(String(20), nullable=True)
    token_address = Column(String(42), nullable=True)
    summary = Column(Text, nullable=False)
    full_report = Column(Text, nullable=False)
    recommendation = Column(String(20), nullable=True)  # BUY, SELL, HOLD, WATCH
    risk_level = Column(String(10), nullable=True)       # LOW, MEDIUM, HIGH
    confidence_score = Column(Integer, nullable=True)    # 0-100
    sources_json = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True)
    published_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())


class ChatMessage(Base):
    """Chat messages between users and Sophia."""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), nullable=False, index=True)
    wallet_address = Column(String(42), nullable=True)
    role = Column(String(10), nullable=False)  # user, sophia
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
