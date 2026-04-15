"""MEME Fund API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from app.database import get_db
from app.models.fund import FundInvestment, FundTransaction, FundStats
from app.services.blockchain import get_sophia_portfolio, verify_transaction

router = APIRouter(prefix="/api/fund", tags=["fund"])


class InvestRequest(BaseModel):
    wallet_address: str
    amount_bnb: float
    tx_hash: str


class FundStatsResponse(BaseModel):
    total_invested_bnb: float
    total_portfolio_value_usd: float
    total_profit_loss_usd: float
    profit_loss_pct: float
    cash_available_bnb: float
    num_investors: int


@router.get("/stats", response_model=FundStatsResponse)
def get_fund_stats(db: Session = Depends(get_db)):
    """Get current fund statistics."""
    stats = db.query(FundStats).order_by(FundStats.snapshot_at.desc()).first()
    if not stats:
        # Return default stats if none exist
        return FundStatsResponse(
            total_invested_bnb=0,
            total_portfolio_value_usd=0,
            total_profit_loss_usd=0,
            profit_loss_pct=0,
            cash_available_bnb=0,
            num_investors=0,
        )
    return FundStatsResponse(
        total_invested_bnb=float(stats.total_invested_bnb),
        total_portfolio_value_usd=float(stats.total_portfolio_value_usd),
        total_profit_loss_usd=float(stats.total_profit_loss_usd),
        profit_loss_pct=float(stats.profit_loss_pct),
        cash_available_bnb=float(stats.cash_available_bnb),
        num_investors=stats.num_investors,
    )


@router.get("/portfolio")
def get_portfolio():
    """Get Sophia's current blockchain portfolio."""
    return get_sophia_portfolio()


@router.post("/invest")
def submit_investment(req: InvestRequest, db: Session = Depends(get_db)):
    """Submit an investment transaction for verification."""
    # Verify transaction on chain
    tx_info = verify_transaction(req.tx_hash)
    if not tx_info.get("confirmed"):
        raise HTTPException(status_code=400, detail="Transaction not confirmed on chain")

    # Check if tx already exists
    existing = db.query(FundInvestment).filter(
        FundInvestment.tx_hash == req.tx_hash
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transaction already recorded")

    investment = FundInvestment(
        wallet_address=req.wallet_address.lower(),
        amount_bnb=Decimal(str(req.amount_bnb)),
        tx_hash=req.tx_hash,
        status="confirmed",
    )
    db.add(investment)

    # Update fund stats
    stats = db.query(FundStats).order_by(FundStats.snapshot_at.desc()).first()
    if stats:
        stats.total_invested_bnb += Decimal(str(req.amount_bnb))
        stats.num_investors = db.query(FundInvestment).filter(
            FundInvestment.status == "confirmed"
        ).distinct(FundInvestment.wallet_address).count() + 1

    db.commit()
    return {"success": True, "message": "投资已确认，Sophia 行长将为您管理这笔资金"}


@router.get("/transactions")
def get_transactions(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent fund transactions by Sophia."""
    txs = (
        db.query(FundTransaction)
        .order_by(FundTransaction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": t.id,
            "tx_type": t.tx_type,
            "token_symbol": t.token_symbol,
            "amount": float(t.amount),
            "price_usd": float(t.price_usd) if t.price_usd else None,
            "tx_hash": t.tx_hash,
            "description": t.description,
            "created_at": t.created_at.isoformat(),
        }
        for t in txs
    ]


@router.get("/my-investment/{wallet_address}")
def get_my_investment(wallet_address: str, db: Session = Depends(get_db)):
    """Get investment details for a specific wallet."""
    investments = (
        db.query(FundInvestment)
        .filter(
            FundInvestment.wallet_address == wallet_address.lower(),
            FundInvestment.status == "confirmed",
        )
        .all()
    )
    total = sum(float(i.amount_bnb) for i in investments)
    return {
        "wallet_address": wallet_address,
        "total_invested_bnb": total,
        "num_transactions": len(investments),
        "transactions": [
            {
                "amount_bnb": float(i.amount_bnb),
                "tx_hash": i.tx_hash,
                "created_at": i.created_at.isoformat(),
            }
            for i in investments
        ],
    }
