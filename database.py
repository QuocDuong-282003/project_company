import motor.motor_asyncio
from beanie import init_beanie
from .odm_models import User ,EventUser

async def init_db():
    # Kết nối tới MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")

    # Chọn database
    database = client.face_recognition_db

    # Khởi tạo Beanie với document model
    await init_beanie(database=database, document_models=[User, EventUser])
