from sqlalchemy import Column, String, DateTime, Numeric, Integer, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base


class LoanRequest(Base):
    """Borrower submits a loan request with collateral (Meme token)."""
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    borrower_address = Column(String(42), nullable=False, index=True)
    collateral_token_symbol = Column(String(20), nullable=False)
    collateral_token_address = Column(String(42), nullable=False)
    collateral_amount = Column(Numeric(36, 18), nullable=False)
    loan_amount_bnb = Column(Numeric(36, 18), nullable=False)
    loan_duration_days = Column(Integer, nullable=False)
    interest_rate_pct = Column(Numeric(5, 2), nullable=False)
    collateral_tx_hash = Column(String(66), nullable=True)
    status = Column(String(20), default="open")  # open, matched, active, repaid, liquidated, cancelled
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)
    matched_at = Column(DateTime, nullable=True)
    repaid_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)


class LoanOffer(Base):
    """Lender offers to fund a specific loan request."""
    __tablename__ = "loan_offers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=False, index=True)
    lender_address = Column(String(42), nullable=False, index=True)
    offered_amount_bnb = Column(Numeric(36, 18), nullable=False)
    proposed_interest_rate_pct = Column(Numeric(5, 2), nullable=True)
    tx_hash = Column(String(66), nullable=True)
    status = Column(String(20), default="pending")  # pending, accepted, rejected, withdrawn
    created_at = Column(DateTime, server_default=func.now())


class LoanContract(Base):
    """Active loan contract between borrower and lender."""
    __tablename__ = "loan_contracts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=False)
    loan_offer_id = Column(Integer, ForeignKey("loan_offers.id"), nullable=False)
    borrower_address = Column(String(42), nullable=False)
    lender_address = Column(String(42), nullable=False)
    collateral_token_symbol = Column(String(20), nullable=False)
    collateral_token_address = Column(String(42), nullable=False)
    collateral_amount = Column(Numeric(36, 18), nullable=False)
    loan_amount_bnb = Column(Numeric(36, 18), nullable=False)
    interest_rate_pct = Column(Numeric(5, 2), nullable=False)
    loan_duration_days = Column(Integer, nullable=False)
    total_repayment_bnb = Column(Numeric(36, 18), nullable=False)
    start_date = Column(DateTime, server_default=func.now())
    due_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="active")  # active, repaid, liquidated
    repayment_tx_hash = Column(String(66), nullable=True)
    liquidation_tx_hash = Column(String(66), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
