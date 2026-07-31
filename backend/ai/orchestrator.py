"""
AI Orchestrator — 5-stage pipeline (as defined in implementation plan §4)

Stage 1: Intent Detection
Stage 2: Knowledge Retrieval
Stage 3: Strategy Validation
Stage 4: Response Generation
Stage 5: Memory Update (async, non-blocking)
"""
import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import AsyncGenerator, Optional

from ai.intent_detector import IntentDetector, IntentResult
from ai.providers.gemini import GeminiProvider
from knowledge.retriever import KnowledgeRetriever, RetrievalResult
from strategy.engine import StrategyEngine, StrategyValidation
from memory.manager import MemoryManager
from ai.prompts.builder import PromptBuilder

logger = logging.getLogger(__name__)


@dataclass
class OrchestratorRequest:
    user_message: str
    conversation_id: str
    user_id: str
    market_context: Optional[dict] = None
    voice_mode: bool = False


@dataclass
class OrchestratorResponse:
    text: str
    intent: str
    citations: list = field(default_factory=list)
    checklist: Optional[dict] = None
    retrieval_score: float = 0.0
    latency_ms: int = 0
    tokens_used: int = 0


class AIOrchestrator:
    """
    Central brain of Traders World AI.
    Routes every request through the 5-stage pipeline.
    The frontend never calls an LLM directly.
    """

    def __init__(self):
        self.intent_detector = IntentDetector()
        self.retriever = KnowledgeRetriever()
        self.strategy_engine = StrategyEngine()
        self.memory_manager = MemoryManager()
        self.prompt_builder = PromptBuilder()
        self.provider = GeminiProvider()

    async def process(self, request: OrchestratorRequest) -> OrchestratorResponse:
        """Non-streaming: return full response."""
        start = time.time()

        # Stage 1
        intent = await self.intent_detector.detect(request.user_message)
        logger.info(f"Intent detected: {intent.intent} (confidence={intent.confidence:.2f})")

        if intent.confidence < 0.6:
            return OrchestratorResponse(
                text="Could you clarify what you'd like help with? For example: 'Evaluate my current setup', 'Teach me about liquidity', or 'Review my last trade'.",
                intent="clarification",
            )

        # Stage 2
        retrieval = await self.retriever.retrieve(request.user_message, intent)
        logger.info(f"Retrieved {len(retrieval.chunks)} chunks, score={retrieval.retrieval_score:.2f}")

        # Stage 3
        validation = None
        if intent.intent in ["live_analysis", "checklist"] and request.market_context:
            validation = self.strategy_engine.validate(request.market_context)

        # Stage 4
        conversation_history = await self.memory_manager.get_conversation_history(request.conversation_id)
        session_state = await self.memory_manager.get_session_state(request.user_id)

        prompt = self.prompt_builder.build(
            intent=intent,
            retrieval=retrieval,
            validation=validation,
            history=conversation_history,
            session_state=session_state,
            user_message=request.user_message,
        )

        response_text, tokens = await self.provider.generate(prompt)
        latency = int((time.time() - start) * 1000)

        # Stage 5 (async — does not block response)
        asyncio.create_task(
            self._update_memory(request, intent, retrieval, validation, response_text, latency, tokens)
        )

        return OrchestratorResponse(
            text=response_text,
            intent=intent.intent,
            citations=retrieval.citations,
            checklist=validation.checklist if validation else None,
            retrieval_score=retrieval.retrieval_score,
            latency_ms=latency,
            tokens_used=tokens,
        )

    async def stream(self, request: OrchestratorRequest) -> AsyncGenerator[str, None]:
        """Streaming: yield tokens as they arrive."""
        start = time.time()

        # Stages 1-3 run before streaming begins
        intent = await self.intent_detector.detect(request.user_message)

        if intent.confidence < 0.6:
            yield "Could you clarify what you'd like help with?"
            return

        retrieval = await self.retriever.retrieve(request.user_message, intent)

        validation = None
        if intent.intent in ["live_analysis", "checklist"] and request.market_context:
            validation = self.strategy_engine.validate(request.market_context)

        conversation_history = await self.memory_manager.get_conversation_history(request.conversation_id)
        session_state = await self.memory_manager.get_session_state(request.user_id)

        prompt = self.prompt_builder.build(
            intent=intent,
            retrieval=retrieval,
            validation=validation,
            history=conversation_history,
            session_state=session_state,
            user_message=request.user_message,
        )

        full_response = ""
        tokens = 0
        async for chunk in self.provider.stream(prompt):
            full_response += chunk
            yield chunk

        latency = int((time.time() - start) * 1000)

        # Stage 5 async after streaming
        asyncio.create_task(
            self._update_memory(request, intent, retrieval, validation, full_response, latency, tokens)
        )

    async def _update_memory(
        self, request, intent, retrieval, validation, response_text, latency_ms, tokens
    ):
        """Stage 5: Memory Update — runs async, never blocks response."""
        try:
            await self.memory_manager.save_message(
                conversation_id=request.conversation_id,
                user_message=request.user_message,
                assistant_response=response_text,
                intent=intent.intent,
                citations=retrieval.citations,
                retrieval_score=retrieval.retrieval_score,
                latency_ms=latency_ms,
                tokens_used=tokens,
            )

            if request.market_context:
                await self.memory_manager.update_session(
                    user_id=request.user_id,
                    symbol=request.market_context.get("symbol"),
                    htf_bias=request.market_context.get("htf_bias"),
                    checklist=validation.checklist if validation else None,
                )

            logger.info(f"Memory updated for conversation {request.conversation_id}")
        except Exception as e:
            logger.error(f"Memory update failed: {e}")
