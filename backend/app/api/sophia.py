"""Sophia AI endpoints - activities, reports, chat."""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import uuid
from app.database import get_db
from app.models.sophia import SophiaActivity, SophiaReport, ChatMessage
from app.services.ai_service import get_sophia_stream, get_sophia_response
from app.services.sophia_agent import sophia_generate_report, get_latest_activities
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/sophia", tags=["sophia"])


@router.get("/activities")
def get_activities(limit: int = 10, db: Session = Depends(get_db)):
    """Get latest Sophia live activities."""
    activities = get_latest_activities(db, limit)
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "token_symbol": a.token_symbol,
            "tx_hash": a.tx_hash,
            "source_url": a.source_url,
            "created_at": a.created_at.isoformat(),
        }
        for a in activities
    ]


@router.get("/reports")
def get_reports(limit: int = 10, db: Session = Depends(get_db)):
    """Get published investment research reports."""
    reports = (
        db.query(SophiaReport)
        .filter(SophiaReport.is_published == True)
        .order_by(SophiaReport.published_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "token_symbol": r.token_symbol,
            "summary": r.summary,
            "recommendation": r.recommendation,
            "risk_level": r.risk_level,
            "confidence_score": r.confidence_score,
            "published_at": r.published_at.isoformat(),
        }
        for r in reports
    ]


@router.get("/reports/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    """Get full investment report."""
    report = db.query(SophiaReport).filter(SophiaReport.id == report_id).first()
    if not report:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": report.id,
        "title": report.title,
        "token_symbol": report.token_symbol,
        "token_address": report.token_address,
        "summary": report.summary,
        "full_report": report.full_report,
        "recommendation": report.recommendation,
        "risk_level": report.risk_level,
        "confidence_score": report.confidence_score,
        "published_at": report.published_at.isoformat(),
    }


@router.post("/generate-report/{token_symbol}")
async def trigger_report_generation(token_symbol: str, db: Session = Depends(get_db)):
    """Trigger Sophia to generate a research report."""
    report = await sophia_generate_report(db, token_symbol.upper())
    if report:
        return {"success": True, "report_id": report.id, "message": f"Sophia 行长已完成 {token_symbol} 的投研报告"}
    return {"success": False, "message": "报告生成失败，请稍后再试"}


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)

    async def send_message(self, session_id: str, message: dict):
        ws = self.active_connections.get(session_id)
        if ws:
            await ws.send_json(message)


manager = ConnectionManager()


@router.websocket("/chat/{session_id}")
async def chat_websocket(
    websocket: WebSocket,
    session_id: str,
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for live chat with Sophia."""
    await manager.connect(websocket, session_id)
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "message",
            "role": "sophia",
            "content": "您好！我是 Sophia 行长，很高兴为您服务。您有什么问题想咨询我吗？",
        })

        # Load chat history
        history = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .limit(20)
            .all()
        )
        messages_history = [
            {"role": m.role if m.role == "user" else "assistant", "content": m.content}
            for m in history
        ]

        while True:
            data = await websocket.receive_json()
            user_message = data.get("content", "").strip()
            wallet_address = data.get("wallet_address")

            if not user_message:
                continue

            # Save user message
            db.add(ChatMessage(
                session_id=session_id,
                wallet_address=wallet_address,
                role="user",
                content=user_message,
            ))
            db.commit()

            # Add to history
            messages_history.append({"role": "user", "content": user_message})

            # Stream Sophia's response
            await websocket.send_json({"type": "start", "role": "sophia"})
            full_response = ""

            for chunk in get_sophia_stream(messages_history[-10:]):  # last 10 messages
                full_response += chunk
                await websocket.send_json({"type": "chunk", "content": chunk})

            await websocket.send_json({"type": "end"})

            # Save Sophia's response
            db.add(ChatMessage(
                session_id=session_id,
                wallet_address=wallet_address,
                role="sophia",
                content=full_response,
            ))
            db.commit()

            messages_history.append({"role": "assistant", "content": full_response})

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(session_id)
