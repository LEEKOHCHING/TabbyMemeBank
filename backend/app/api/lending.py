"""P2P Lending API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.loan import LoanRequest, LoanOffer, LoanContract
from app.services.blockchain import verify_transaction, get_token_balance
from app.services.ai_service import evaluate_loan_risk

router = APIRouter(prefix="/api/lending", tags=["lending"])


class LoanRequestCreate(BaseModel):
    borrower_address: str
    collateral_token_symbol: str
    collateral_token_address: str
    collateral_amount: float
    loan_amount_bnb: float
    loan_duration_days: int
    interest_rate_pct: float
    collateral_tx_hash: str
    notes: Optional[str] = None


class LoanOfferCreate(BaseModel):
    loan_request_id: int
    lender_address: str
    offered_amount_bnb: float
    proposed_interest_rate_pct: Optional[float] = None
    tx_hash: str


@router.get("/requests")
def get_loan_requests(status: str = "open", limit: int = 20, db: Session = Depends(get_db)):
    """Get available loan requests for lenders."""
    requests = (
        db.query(LoanRequest)
        .filter(LoanRequest.status == status)
        .order_by(LoanRequest.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "borrower_address": r.borrower_address,
            "collateral_token_symbol": r.collateral_token_symbol,
            "collateral_token_address": r.collateral_token_address,
            "collateral_amount": float(r.collateral_amount),
            "loan_amount_bnb": float(r.loan_amount_bnb),
            "loan_duration_days": r.loan_duration_days,
            "interest_rate_pct": float(r.interest_rate_pct),
            "status": r.status,
            "created_at": r.created_at.isoformat(),
            "expires_at": r.expires_at.isoformat() if r.expires_at else None,
        }
        for r in requests
    ]


@router.post("/requests")
def create_loan_request(req: LoanRequestCreate, db: Session = Depends(get_db)):
    """Create a new loan request (borrower deposits collateral)."""
    # Verify collateral transaction
    tx_info = verify_transaction(req.collateral_tx_hash)
    if not tx_info.get("confirmed"):
        raise HTTPException(status_code=400, detail="Collateral transaction not confirmed")

    # AI risk evaluation
    risk = evaluate_loan_risk({
        "collateral_token": req.collateral_token_symbol,
        "collateral_amount": req.collateral_amount,
        "loan_amount_bnb": req.loan_amount_bnb,
        "loan_duration_days": req.loan_duration_days,
        "interest_rate_pct": req.interest_rate_pct,
    })

    if risk.get("recommendation") == "REJECT":
        raise HTTPException(
            status_code=400,
            detail=f"Sophia 行长拒绝了此借贷申请：{risk.get('analysis', '风险过高')}"
        )

    loan = LoanRequest(
        borrower_address=req.borrower_address.lower(),
        collateral_token_symbol=req.collateral_token_symbol.upper(),
        collateral_token_address=req.collateral_token_address.lower(),
        collateral_amount=Decimal(str(req.collateral_amount)),
        loan_amount_bnb=Decimal(str(req.loan_amount_bnb)),
        loan_duration_days=req.loan_duration_days,
        interest_rate_pct=Decimal(str(req.interest_rate_pct)),
        collateral_tx_hash=req.collateral_tx_hash,
        status="open",
        expires_at=datetime.now() + timedelta(days=7),
        notes=req.notes,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    return {
        "success": True,
        "loan_id": loan.id,
        "risk_assessment": risk,
        "message": "借贷申请已提交，正在等待放贷方匹配",
    }


@router.post("/offers")
def create_loan_offer(offer: LoanOfferCreate, db: Session = Depends(get_db)):
    """Create a loan offer (lender funds a request)."""
    loan = db.query(LoanRequest).filter(LoanRequest.id == offer.loan_request_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if loan.status != "open":
        raise HTTPException(status_code=400, detail="Loan request is not open")

    # Verify payment transaction
    tx_info = verify_transaction(offer.tx_hash)
    if not tx_info.get("confirmed"):
        raise HTTPException(status_code=400, detail="Payment transaction not confirmed")

    # Create offer
    loan_offer = LoanOffer(
        loan_request_id=offer.loan_request_id,
        lender_address=offer.lender_address.lower(),
        offered_amount_bnb=Decimal(str(offer.offered_amount_bnb)),
        proposed_interest_rate_pct=Decimal(str(offer.proposed_interest_rate_pct)) if offer.proposed_interest_rate_pct else None,
        tx_hash=offer.tx_hash,
        status="accepted",
    )
    db.add(loan_offer)

    # Create contract
    interest_rate = Decimal(str(offer.proposed_interest_rate_pct or float(loan.interest_rate_pct)))
    total_repayment = Decimal(str(offer.offered_amount_bnb)) * (1 + interest_rate / 100)
    contract = LoanContract(
        loan_request_id=offer.loan_request_id,
        loan_offer_id=0,  # will update after flush
        borrower_address=loan.borrower_address,
        lender_address=offer.lender_address.lower(),
        collateral_token_symbol=loan.collateral_token_symbol,
        collateral_token_address=loan.collateral_token_address,
        collateral_amount=loan.collateral_amount,
        loan_amount_bnb=Decimal(str(offer.offered_amount_bnb)),
        interest_rate_pct=interest_rate,
        loan_duration_days=loan.loan_duration_days,
        total_repayment_bnb=total_repayment,
        due_date=datetime.now() + timedelta(days=loan.loan_duration_days),
    )
    db.add(contract)

    # Update loan status
    loan.status = "active"
    loan.matched_at = datetime.now()

    db.flush()
    contract.loan_offer_id = loan_offer.id
    db.commit()

    return {
        "success": True,
        "contract_id": contract.id,
        "total_repayment_bnb": float(total_repayment),
        "due_date": contract.due_date.isoformat(),
        "message": "放贷成功！借贷合约已生效",
    }


@router.get("/my-loans/{wallet_address}")
def get_my_loans(wallet_address: str, db: Session = Depends(get_db)):
    """Get all loans for a wallet (as borrower or lender)."""
    addr = wallet_address.lower()

    borrowing = (
        db.query(LoanContract)
        .filter(LoanContract.borrower_address == addr)
        .order_by(LoanContract.created_at.desc())
        .all()
    )

    lending = (
        db.query(LoanContract)
        .filter(LoanContract.lender_address == addr)
        .order_by(LoanContract.created_at.desc())
        .all()
    )

    def contract_dict(c):
        return {
            "id": c.id,
            "collateral_token": c.collateral_token_symbol,
            "collateral_amount": float(c.collateral_amount),
            "loan_amount_bnb": float(c.loan_amount_bnb),
            "interest_rate_pct": float(c.interest_rate_pct),
            "total_repayment_bnb": float(c.total_repayment_bnb),
            "due_date": c.due_date.isoformat(),
            "status": c.status,
        }

    return {
        "borrowing": [contract_dict(c) for c in borrowing],
        "lending": [contract_dict(c) for c in lending],
    }
