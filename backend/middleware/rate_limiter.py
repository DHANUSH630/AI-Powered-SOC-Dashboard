"""
Rate Limiting Middleware for SentinelAI.

Implements a simple in-memory sliding window rate limiter
to protect API endpoints from abuse.
"""

import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory rate limiting middleware using a sliding window counter.

    Attributes:
        rate_limit: Maximum number of requests allowed per window.
        window_seconds: Duration of the sliding window in seconds.
        requests: Dictionary tracking request timestamps per client IP.
    """

    def __init__(
        self,
        app,
        rate_limit: int = 100,
        window_seconds: int = 60,
    ):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract the client IP address from the request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _clean_old_requests(self, client_ip: str, now: float) -> None:
        """Remove request timestamps outside the current window."""
        cutoff = now - self.window_seconds
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip] if ts > cutoff
        ]

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process the request and apply rate limiting."""
        # Skip rate limiting for health checks
        if request.url.path == "/api/v1/health":
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()

        self._clean_old_requests(client_ip, now)

        if len(self.requests[client_ip]) >= self.rate_limit:
            retry_after = int(
                self.window_seconds
                - (now - self.requests[client_ip][0])
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": max(retry_after, 1),
                },
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        self.requests[client_ip].append(now)
        response = await call_next(request)

        # Add rate limit headers
        remaining = self.rate_limit - len(self.requests[client_ip])
        response.headers["X-RateLimit-Limit"] = str(self.rate_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(
            int(now + self.window_seconds)
        )

        return response
