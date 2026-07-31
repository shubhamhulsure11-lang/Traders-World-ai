"""
Stage 1: Intent Detection
Classifies user message into one of the defined trading intents.
"""
import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from ai.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)

INTENT_PROMPT = """You are an intent classifier for Traders World AI — an AI Trading Copilot.

Classify the user's message into EXACTLY ONE of these intents:
- live_analysis: User wants to evaluate a current setup or trade opportunity
- teaching: User wants to learn a trading concept or strategy
- checklist: User wants to run through the pre-trade checklist
- journal_review: User wants to review a past trade or journal entry
- backtest_query: User wants statistics or historical performance data
- psychology: User about emotions, FOMO, discipline, or trading psychology
- strategy_question: User asks about a specific rule or strategy concept
- general: General question or conversation

Also detect:
- role: best AI role (teacher | coach | analyst | researcher)
- needs_market_context: does the response require live chart/price data?
- symbols_mentioned: list of trading symbols mentioned (e.g. ["XAUUSD"])
- timeframes_mentioned: list of timeframes mentioned (e.g. ["1H", "1m"])

Respond ONLY with valid JSON. No explanation.

Example:
{
  "intent": "live_analysis",
  "role": "analyst",
  "confidence": 0.92,
  "needs_market_context": true,
  "needs_screenshot": false,
  "symbols_mentioned": ["XAUUSD"],
  "timeframes_mentioned": ["1H", "1m"]
}

User message: {message}
"""


@dataclass
class IntentResult:
    intent: str = "general"
    role: str = "coach"
    confidence: float = 0.8
    needs_market_context: bool = False
    needs_screenshot: bool = False
    symbols_mentioned: list = field(default_factory=list)
    timeframes_mentioned: list = field(default_factory=list)


class IntentDetector:
    def __init__(self):
        self._provider: Optional[GeminiProvider] = None

    @property
    def provider(self):
        if self._provider is None:
            self._provider = GeminiProvider()
        return self._provider

    async def detect(self, message: str) -> IntentResult:
        """Classify intent using a fast Gemini Flash call."""
        try:
            prompt = INTENT_PROMPT.format(message=message)
            response, _ = await self.provider.generate(prompt, model="flash")
            # Extract JSON from response
            text = response.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            data = json.loads(text)
            return IntentResult(**data)
        except Exception as e:
            logger.warning(f"Intent detection failed, using fallback: {e}")
            return IntentResult()  # sensible defaults
