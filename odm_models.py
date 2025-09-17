from beanie import Document, Indexed
from pydantic import Field
from typing import List, Optional
from datetime import datetime

class User(Document):
    
    name: str
    user_code: Indexed(str, unique=True)
    email: Indexed(str, unique=True)
    role: str
    
    is_admin: bool = Field(default=False)
    is_super_admin: bool = Field(default=False)  # Super admin phân quyền cao nhất
    password: Optional[str] = None 
    face_encodings: Optional[List[bytes]] = None
    face_image_base64: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
class EventUser(Document):
    name: str
    email: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    face_image_base64: Optional[str] = None
    face_encoding: str = None  

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "event_users"