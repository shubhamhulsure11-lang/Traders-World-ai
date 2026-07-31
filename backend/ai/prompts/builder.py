"""
Prompt Builder — assembles the full prompt from all pipeline stages.
Order: System → Role → Knowledge → Strategy Validation → History → Session → User
"""
from ai.prompts.system import SYSTEM_PROMPT
from ai.prompts.roles import ROLE_PROMPTS
from ai.prompts.output_format import OUTPUT_FORMAT


class PromptBuilder:

    def build(
        self,
        intent,
        retrieval,
        validation,
        history: list,
        session_state: dict,
        user_message: str,
    ) -> list:
        """
        Builds a structured prompt as a list of content parts for Gemini.
        Returns a list of strings assembled as the full context.
        """
        parts = []

        # 1. System Prompt (permanent rules)
        parts.append(f"<system>\n{SYSTEM_PROMPT}\n</system>")

        # 2. Role Prompt
        role_prompt = ROLE_PROMPTS.get(intent.role, ROLE_PROMPTS["coach"])
        parts.append(f"<role>\n{role_prompt}\n</role>")

        # 3. Knowledge Context (RAG)
        if retrieval.chunks:
            knowledge_section = self._format_knowledge(retrieval)
            parts.append(f"<knowledge>\n{knowledge_section}\n</knowledge>")

        if retrieval.retrieval_score < 0.3:
            parts.append(
                "<knowledge_gap>WARNING: No highly relevant strategy documentation was found for this query. "
                "You must acknowledge this gap and not invent strategy rules.</knowledge_gap>"
            )

        # 4. Strategy Validation
        if validation:
            checklist_section = self._format_checklist(validation)
            parts.append(f"<strategy_validation>\n{checklist_section}\n</strategy_validation>")

        # 5. Conversation History (last 8 turns max)
        if history:
            history_section = self._format_history(history[-8:])
            parts.append(f"<conversation_history>\n{history_section}\n</conversation_history>")

        # 6. Trading Session State
        if session_state:
            parts.append(f"<session_state>\n{self._format_session(session_state)}\n</session_state>")

        # 7. Output Format Instructions
        parts.append(f"<output_format>\n{OUTPUT_FORMAT}\n</output_format>")

        # 8. User Message
        parts.append(f"<user_message>\n{user_message}\n</user_message>")

        return "\n\n".join(parts)

    def _format_knowledge(self, retrieval) -> str:
        lines = []
        for i, chunk in enumerate(retrieval.chunks, 1):
            lines.append(
                f"[{i}] SOURCE: {chunk.get('source_file', 'unknown')} | "
                f"SECTION: {chunk.get('heading', '')} | "
                f"CATEGORY: {chunk.get('category', '')}\n"
                f"{chunk.get('text', '')}"
            )
        return "\n\n---\n\n".join(lines)

    def _format_checklist(self, validation) -> str:
        lines = [f"VERDICT: {validation.verdict.upper()} | CONFIDENCE: {validation.confidence.upper()}"]
        lines.append("\nChecklist:")
        for rule, status in validation.checklist.items():
            icon = "✅" if status is True else ("❌" if status is False else "❓")
            lines.append(f"  {icon} {rule}: {status}")
        if validation.rules_missing:
            lines.append(f"\nMissing rules: {', '.join(validation.rules_missing)}")
        return "\n".join(lines)

    def _format_history(self, history: list) -> str:
        lines = []
        for msg in history:
            role = msg.get("role", "user").upper()
            content = msg.get("content", "")[:500]  # truncate long messages
            lines.append(f"{role}: {content}")
        return "\n".join(lines)

    def _format_session(self, session: dict) -> str:
        lines = []
        for k, v in session.items():
            if v:
                lines.append(f"{k}: {v}")
        return "\n".join(lines)
