# app/middleware/rate_limit.py

import time
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Simple in-memory store: { (ip, route): [count, window_start_ts] }
RATE_LIMIT_STORE: dict[tuple[str, str], list[float]] = {}

# Config: requests per window (seconds)
WINDOW_SECONDS = 60
LIMITS = {
    "/api/v1/embed": 3,   # max 3 per minute
    "/api/v1/search": 10, # max 10 per minute
    # you can add "/api/v1/export" if you want
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # Only apply to paths we care about
        matched_prefix = None
        for route_prefix in LIMITS.keys():
            if path.startswith(route_prefix):
                matched_prefix = route_prefix
                break

        if not matched_prefix:
            # No rate limit for this route
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = (client_ip, matched_prefix)

        now = time.time()
        limit = LIMITS[matched_prefix]

        count, window_start = RATE_LIMIT_STORE.get(key, [0, now])

        # Reset window if expired
        if now - window_start > WINDOW_SECONDS:
            count = 0
            window_start = now

        # Increment and check
        count += 1

        if count > limit:
            # Store updated state anyway
            RATE_LIMIT_STORE[key] = [count, window_start]
            retry_after = int(WINDOW_SECONDS - (now - window_start))
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded. Try again later.",
                    "limit": limit,
                    "window_seconds": WINDOW_SECONDS,
                },
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        # Store updated state
        RATE_LIMIT_STORE[key] = [count, window_start]

        # Continue to endpoint
        response = await call_next(request)
        return response
