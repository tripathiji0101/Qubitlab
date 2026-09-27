"""LLM provider abstraction — supports native Gemini API and OpenAI-compatible endpoints."""

import httpx
from typing import Optional
from app.core.config import settings
from app.core.logging import logger


class LLMError(Exception):
    """Raised when the LLM call fails after retries."""


async def call_llm(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    max_tokens: int = 1500,
    temperature: float = 0.7,
) -> str:
    """Call Gemini native API or OpenAI-compatible endpoint with retry and error handling."""
    if not settings.AI_API_KEY:
        raise LLMError("No AI API key configured")

    model = model or settings.AI_MODEL or "gemini-3.6-flash"
    base_url = (settings.AI_BASE_URL or "").strip().rstrip("/")
    is_gemini = (settings.AI_PROVIDER == "gemini" or "generativelanguage.googleapis.com" in base_url)

    last_error: Optional[Exception] = None

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                if is_gemini:
                    # Google Gemini native API
                    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
                    gemini_payload = {
                        "system_instruction": {
                            "parts": [{"text": system_prompt}]
                        },
                        "contents": [
                            {"role": "user", "parts": [{"text": user_message}]}
                        ],
                        "generationConfig": {
                            "maxOutputTokens": max_tokens,
                            "temperature": temperature,
                        }
                    }
                    resp = await client.post(endpoint, json=gemini_payload)
                    if resp.status_code == 429:
                        logger.warning("Gemini rate limited (attempt %d/3)", attempt + 1)
                        import asyncio
                        await asyncio.sleep(2 ** attempt)
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise LLMError("Gemini returned no candidates")
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if not parts or "text" not in parts[0]:
                        raise LLMError("Gemini response missing text")
                    return parts[0]["text"]
                else:
                    # Standard OpenAI-compatible API
                    endpoint = f"{base_url or 'https://api.openai.com/v1'}/chat/completions"
                    headers = {
                        "Authorization": f"Bearer {settings.AI_API_KEY}",
                        "Content-Type": "application/json",
                    }
                    openai_payload = {
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    }
                    resp = await client.post(endpoint, json=openai_payload, headers=headers)
                    if resp.status_code == 429:
                        logger.warning("LLM rate limited (attempt %d/3)", attempt + 1)
                        import asyncio
                        await asyncio.sleep(2 ** attempt)
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    if not content:
                        raise LLMError("LLM returned empty response")
                    return content

        except httpx.TimeoutException as e:
            logger.warning("LLM timeout (attempt %d/3): %s", attempt + 1, e)
            last_error = e
        except httpx.HTTPStatusError as e:
            logger.warning("LLM HTTP error %d (attempt %d/3): %s", e.response.status_code, attempt + 1, e)
            last_error = e
            if e.response.status_code in (400, 401, 403, 404):
                break
        except Exception as e:
            logger.warning("LLM error (attempt %d/3): %s", attempt + 1, e)
            last_error = e

    raise LLMError(f"LLM call failed after retries: {last_error}")
