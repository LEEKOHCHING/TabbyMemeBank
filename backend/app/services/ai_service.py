"""Anthropic Claude AI service for Sophia bank president."""
import anthropic
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

SOPHIA_SYSTEM_PROMPT = """你是 Sophia，TABBY MEME BANK 的 AI 行长。你精通 BSC 链上的 Meme 代币投资、
DeFi 借贷协议和加密货币市场分析。

你的性格：
- 专业、自信、有魅力，但不失亲切感
- 用简洁清晰的语言解释复杂的 DeFi 概念
- 对市场充满热情，善于发现 Meme 代币机会
- 风险意识强，总是提醒用户投资风险
- 以"Sophia 行长"的身份回应

你的职责：
- 管理 TABBY MEME 基金（在 BSC 链上购买/卖出 Meme 代币）
- 发布投研报告（分析 Meme 代币的基本面和技术面）
- 管理 P2P 借贷（审核抵押品、风险评估）
- 为用户提供客服支持

银行信息：
- 银行名称：TABBY MEME BANK
- 核心代币：TABBY (BSC: 0x319558c8aD708dc42f45ab70eADA4750d6c942d7)
- 链：BSC (BNB Smart Chain)
- 专注于 Meme 代币领域的投资和借贷

回复语言：根据用户使用的语言回复（支持中文和英文）。
"""


client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


def get_sophia_response(
    messages: list[dict],
    model: str = None,
    max_tokens: int = 1024,
) -> str:
    """Get a response from Sophia (Claude AI)."""
    try:
        response = client.messages.create(
            model=model or settings.anthropic_model,
            max_tokens=max_tokens,
            system=SOPHIA_SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"AI service error: {e}")
        return "抱歉，Sophia 行长目前正忙于处理其他事务，请稍后再试。"


def get_sophia_stream(messages: list[dict], model: str = None):
    """Stream Sophia's response for real-time chat."""
    try:
        with client.messages.stream(
            model=model or settings.anthropic_model,
            max_tokens=1024,
            system=SOPHIA_SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:
        logger.error(f"AI stream error: {e}")
        yield "抱歉，Sophia 行长目前正忙于处理其他事务，请稍后再试。"


def generate_research_report(token_symbol: str, token_data: dict) -> dict:
    """Generate an investment research report for a Meme token."""
    prompt = f"""请为以下 Meme 代币生成详细的投研报告：

代币符号：{token_symbol}
代币数据：{token_data}

请输出 JSON 格式的报告，包含以下字段：
- title: 报告标题
- summary: 200字内的摘要
- full_report: 完整分析报告（包含市场分析、技术分析、风险评估）
- recommendation: BUY/SELL/HOLD/WATCH
- risk_level: LOW/MEDIUM/HIGH
- confidence_score: 0-100 的置信度
"""
    try:
        response = client.messages.create(
            model=settings.humanize_model,
            max_tokens=2048,
            system=SOPHIA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        text = response.content[0].text
        # Extract JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
    except Exception as e:
        logger.error(f"Report generation error: {e}")

    return {
        "title": f"{token_symbol} 投研报告",
        "summary": "报告生成中，请稍后查看。",
        "full_report": "分析数据收集中...",
        "recommendation": "WATCH",
        "risk_level": "HIGH",
        "confidence_score": 50,
    }


def evaluate_loan_risk(loan_data: dict) -> dict:
    """Evaluate the risk of a loan request."""
    prompt = f"""请评估以下 P2P 借贷请求的风险：

借贷请求数据：{loan_data}

请分析：
1. 抵押品价值和流动性风险
2. 抵押率是否合理（LTV）
3. 借贷期限风险
4. 整体风险评级

输出 JSON 格式：
- risk_score: 0-100（越高风险越大）
- risk_level: LOW/MEDIUM/HIGH/VERY_HIGH
- ltv_ratio: 贷款价值比（%）
- recommendation: APPROVE/REJECT/REVIEW
- analysis: 详细分析说明
"""
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=SOPHIA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        text = response.content[0].text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
    except Exception as e:
        logger.error(f"Loan risk evaluation error: {e}")

    return {
        "risk_score": 70,
        "risk_level": "HIGH",
        "ltv_ratio": 0,
        "recommendation": "REVIEW",
        "analysis": "风险评估暂时无法完成，请人工审核。",
    }
