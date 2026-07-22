from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, TEXT
from backend.config import settings
from loguru import logger

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def init_indexes(database):
    """Create indexes for all collections according to database design specs."""
    try:
        # Users collection indexes
        await database.users.create_index("email", unique=True)
        await database.users.create_index("role")

        # Alerts collection indexes
        await database.alerts.create_index([("timestamp", DESCENDING)])
        await database.alerts.create_index([("severity", ASCENDING), ("status", ASCENDING)])
        await database.alerts.create_index("sourceIP")
        await database.alerts.create_index("attackType")

        # Incidents collection indexes
        await database.incidents.create_index("incidentNumber", unique=True)
        await database.incidents.create_index("assignedAnalyst")
        await database.incidents.create_index("status")
        await database.incidents.create_index("priority")

        # Logs collection indexes & TTL
        await database.logs.create_index([("timestamp", DESCENDING)])
        await database.logs.create_index("logType")
        await database.logs.create_index("severity")
        await database.logs.create_index([("message", TEXT)])

        # Threat Intelligence cache index with TTL (24h = 86400s)
        await database.threat_intel.create_index("indicator", unique=True)
        await database.threat_intel.create_index("updatedAt", expireAfterSeconds=86400)

        # Audit Log index
        await database.audit_logs.create_index([("timestamp", DESCENDING)])
        await database.audit_logs.create_index("userId")

        logger.info("Database indexes successfully initialized.")
    except Exception as e:
        logger.warning(f"Note on index initialization: {e}")

async def connect_to_mongo():
    """Establish async MongoDB connection and initialize indexes."""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        database = db.client[settings.DATABASE_NAME]
        await init_indexes(database)
        logger.info(f"Connected to MongoDB database: '{settings.DATABASE_NAME}'")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")

async def close_mongo_connection():
    """Gracefully disconnect from MongoDB."""
    if db.client is not None:
        db.client.close()
        logger.info("Closed MongoDB connection.")

def get_database():
    """Return Motor database instance."""
    if db.client is None:
        raise RuntimeError("MongoDB client is not connected.")
    return db.client[settings.DATABASE_NAME]
