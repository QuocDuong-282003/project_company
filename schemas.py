from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserOut(BaseModel):
    name: str
    user_code: str

class AdminUserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    user_code: str
    role: str
    face_image_base64: Optional[str] = None
    is_admin: bool
    is_super_admin: bool
    created_at: datetime 

class UserUpdate(BaseModel):
    name: Optional[str] = None
    user_code: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None