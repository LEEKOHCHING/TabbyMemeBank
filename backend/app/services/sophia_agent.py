"""Sophia Agent - autonomous AI bank president activities."""
import asyncio
import random
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.ai_service import generate_research_report, get_sophia_response
from app.services.blockchain import get_sophia_portfolio, get_tabby_token_info
from app.services.twitter import search_token_tweets, get_kol_tweets
from app.models.sophia import SophiaActivity, SophiaReport
import logging

logger = logging.getLogger(__name__)

MEME_TOKENS_WATCHLIST = [
    {"symbol": "PEPE", "address": "0x25d887Ce7a35172C62FeBFD67a1856F20Faebb00"},
    {"symbol": "SHIB", "address": "0x2859e4544C4bB03966803b044A93563Bd2D0DD4"},
    {"symbol": "FLOKI", "address": "0xfb5B838b6cfEEdC2873aB27866079AC55363D37"},
    {"symbol": "DOGE", "address": "0xbA2aE424d960c26247Dd6c32edC70B295c744C43"},
    {"symbol": "WOJAK", "address": "0x5Da6d0f62Df5882b38a7b78f4d5B86f0C4b08A73"},
]

ACTIVITY_TEMPLATES = [
    "正在 X 推特上分析 {token} 的社区热度和讨论趋势...",
    "检查 {token} 的链上数据和持仓分布...",
    "分析 {token}/BNB 交易对的流动性深度...",
    "扫描 BSC 链上的新兴 Meme 代币机会...",
    "查看 KOL 们对 Meme 市场的最新看法...",
    "评估 TABBY MEME 基金当前持仓的风险收益比...",
    "在 PancakeSwap 上监控 {token} 的价格走势...",
    "整理最新的 Meme 代币投研数据...",
    "审核新的 P2P 借贷申请...",
    "更新 TABBY MEME 基金的净值计算...",
]


async def record_activity(db: Session, activity_type: str, description: str,
                          token_symbol: str = None, token_address: str = None,
                          tx_hash: str = None, source_url: str = None,
                          metadata: dict = None):
    """Record a Sophia activity to the database."""
    try:
        activity = SophiaActivity(
            activity_type=activity_type,
            description=description,
            token_symbol=token_symbol,
            token_address=token_address,
            tx_hash=tx_hash,
            source_url=source_url,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
    except Exception as e:
        logger.error(f"Error recording activity: {e}")
        db.rollback()
        return None


async def sophia_market_scan(db: Session):
    """Sophia scans the market and records activities."""
    token = random.choice(MEME_TOKENS_WATCHLIST)
    template = random.choice(ACTIVITY_TEMPLATES)
    description = template.format(token=token["symbol"])

    activity_type = "market_scan"
    if "推特" in description or "X" in description:
        activity_type = "twitter_research"
        # Actually search Twitter
        tweets = search_token_tweets(token["symbol"], max_results=5)
        if tweets:
            description = f"正在分析 X 推特上关于 ${token['symbol']} 的 {len(tweets)} 条最新推文..."

    await record_activity(
        db=db,
        activity_type=activity_type,
        description=description,
        token_symbol=token["symbol"],
        token_address=token["address"],
    )


async def sophia_generate_report(db: Session, token_symbol: str = None):
    """Sophia generates an investment research report."""
    if not token_symbol:
        token = random.choice(MEME_TOKENS_WATCHLIST)
        token_symbol = token["symbol"]
        token_address = token["address"]
    else:
        token_address = None

    await record_activity(
        db=db,
        activity_type="report_generating",
        description=f"Sophia 行长正在撰写 {token_symbol} 的投研报告...",
        token_symbol=token_symbol,
    )

    # Get token data
    tweets = search_token_tweets(token_symbol, max_results=10)
    token_data = {
        "symbol": token_symbol,
        "address": token_address,
        "recent_tweets": tweets[:5],
        "analysis_date": datetime.now().isoformat(),
    }

    # Generate report with Claude AI
    report_data = generate_research_report(token_symbol, token_data)

    try:
        report = SophiaReport(
            title=report_data.get("title", f"{token_symbol} 投研报告"),
            token_symbol=token_symbol,
            token_address=token_address,
            summary=report_data.get("summary", ""),
            full_report=report_data.get("full_report", ""),
            recommendation=report_data.get("recommendation", "WATCH"),
            risk_level=report_data.get("risk_level", "HIGH"),
            confidence_score=report_data.get("confidence_score", 50),
        )
        db.add(report)
        db.commit()

        await record_activity(
            db=db,
            activity_type="report_published",
            description=f"发布了 {token_symbol} 的最新投研报告 - 建议：{report_data.get('recommendation', 'WATCH')}",
            token_symbol=token_symbol,
        )
        return report
    except Exception as e:
        logger.error(f"Error saving report: {e}")
        db.rollback()
        return None


def get_latest_activities(db: Session, limit: int = 10) -> list:
    """Get the latest Sophia activities."""
    return (
        db.query(SophiaActivity)
        .filter(SophiaActivity.is_visible == True)
        .order_by(SophiaActivity.created_at.desc())
        .limit(limit)
        .all()
    )
