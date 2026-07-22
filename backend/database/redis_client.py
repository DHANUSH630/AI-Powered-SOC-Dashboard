import redis.asyncio as redis
from backend.config import settings
from loguru import logger

class RedisCache:
    client: redis.Redis = None

redis_cache = RedisCache()

async def connect_to_redis():
    try:
        redis_cache.client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        logger.info("Connected to Redis")
    except Exception as e:
        logger.error(f"Error connecting to Redis: {e}")

async def close_redis_connection():
    if redis_cache.client is not None:
        await redis_cache.client.close()
        logger.info("Closed Redis connection")

def get_redis():
    return redis_cache.client
