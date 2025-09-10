# backend/odm_models.py

from beanie import Document, Indexed
from typing import List, Optional

class User(Document):
    name: str
    user_code: Indexed(str, unique=True)
    
    # THÊM 2 TRƯỜNG MỚI
    email: Indexed(str, unique=True) # Email cũng nên là duy nhất
    role: str # Vai trò/Chức vụ
    
    face_encodings: List[bytes]
    face_image_base64: Optional[str] = None

    class Settings:
        name = "users"