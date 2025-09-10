# backend/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema cũ, vẫn dùng cho dashboard của client (nếu có)
class UserOut(BaseModel):
    name: str
    user_code: str

# Schema MỚI để hiển thị đầy đủ thông tin user trên trang admin
class AdminUserOut(BaseModel):
    id: str # Beanie dùng _id, nhưng ta sẽ convert nó thành str
    name: str
    email: EmailStr
    user_code: str
    role: str
    face_image_base64: Optional[str] = None
    is_admin: bool

# Schema MỚI cho việc cập nhật thông tin user
class UserUpdate(BaseModel):
    name: Optional[str] = None
    user_code: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None