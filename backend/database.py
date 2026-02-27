import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "vpp_database"

class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect(cls):
        try:
            cls.client = AsyncIOMotorClient(MONGO_URL)
            logger.info("Connected to MongoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    @classmethod
    def get_db(cls):
        if cls.client is None:
            raise Exception("Database client not initialized. Call connect() first.")
        return cls.client[DB_NAME]

    @classmethod
    async def save_state(cls, collection_name: str, document: dict):
        db = cls.get_db()
        collection = db[collection_name]
        await collection.insert_one(document)

    @classmethod
    async def get_latest_state(cls, collection_name: str):
         db = cls.get_db()
         collection = db[collection_name]
         return await collection.find_one(sort=[("_id", -1)])
