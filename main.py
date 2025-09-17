# --- START OF FILE main.py ---

import base64
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import EmailStr, BaseModel
import numpy as np
import cv2
import pickle
import face_recognition
from typing import List, Optional
from bson import ObjectId
from datetime import timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
#from pathlib import Path
from .odm_models import EventUser
from fastapi import Path as ApiPath  # Đổi tên để dùng cho endpoint
from pathlib import Path  # Dùng cho xử lý file hệ thống
from .database import init_db
from .odm_models import User
from .schemas import UserOut, AdminUserOut, UserUpdate
from .face_validator import analyze_face
from .auth_utils import verify_password, get_password_hash, create_access_token
from .email_utils import send_password_reset_email
from .face_detector import detect_faces_opencv

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Face Recognition API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- XÁC THỰC ADMIN (JWT) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/system-admin/login-form")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# HÀM NÀY: Dùng cho các endpoint BẮT BUỘC xác thực
async def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None: raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get(ObjectId(user_id))
    if user is None or not user.is_admin:
        raise credentials_exception
    return user

# HÀM MỚI: Dùng cho các endpoint có thể có hoặc KHÔNG có token (như trang đăng ký)
async def get_optional_current_admin_user(authorization: Optional[str] = Header(None)):
    if authorization is None:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = await User.get(ObjectId(user_id))
        if user and user.is_admin:
            return user
        return None
    except (JWTError, ValueError):
        return None

# --- KẾT THÚC XÁC THỰC ---

@app.on_event("startup")
async def on_startup():
    await init_db()

def bytes_to_cv2_img(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# --- API CLIENT ---
@app.post("/validate-face")
async def validate_face_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    return analyze_face(image)

@app.post("/register")
async def register_endpoint(
    name: str = Form(...), user_code: str = Form(...), email: EmailStr = Form(...), 
    role: str = Form(...), file: UploadFile = File(...)
):
    if await User.find_one(User.user_code == user_code):
        raise HTTPException(status_code=400, detail="Mã số đã tồn tại")
    if await User.find_one(User.email == email):
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    
    face_locations = detect_faces_opencv(image)
    if not face_locations:
        raise HTTPException(status_code=400, detail="Không tìm thấy khuôn mặt trong ảnh để đăng ký")
    if len(face_locations) > 1:
        raise HTTPException(status_code=400, detail="Phát hiện nhiều hơn 1 khuôn mặt, vui lòng chỉ chụp một người")

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    new_face_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
    
    all_users = await User.find(User.is_admin == False, User.face_encodings != None).to_list()
    if all_users:
        existing_encodings = [pickle.loads(enc) for user in all_users if user.face_encodings for enc in user.face_encodings]
        if existing_encodings:
            matches = face_recognition.compare_faces(existing_encodings, new_face_encoding, tolerance=0.6)
            if True in matches:
                raise HTTPException(status_code=400, detail="Khuôn mặt này đã được đăng ký.")

    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    encoding_bytes = pickle.dumps(new_face_encoding)
    
    new_user = User(
        name=name, user_code=user_code, email=email, role=role, is_admin=False,
        face_encodings=[encoding_bytes], face_image_base64=image_base64
    )
    await new_user.insert()
    return {"status": "success", "message": f"Đăng ký thành công cho {name}!"}

@app.post("/login-recognize")
async def login_recognize_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    
    face_locations = detect_faces_opencv(image)
    if not face_locations:
        return {"status": "NO_FACE", "message": "Không tìm thấy khuôn mặt nào.", "data": None}
    if len(face_locations) > 1:
        return {"status": "MULTIPLE_FACES", "message": "Phát hiện nhiều hơn một khuôn mặt.", "data": None}
        
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    unknown_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
    box = face_locations[0]
    box_for_json = tuple(map(int, box))
    
    all_users = await User.find(User.is_admin == False, User.face_encodings != None).to_list()
    if not all_users:
         return {"status": "UNKNOWN", "message": "Không có dữ liệu người dùng.", "data": {"name": "Unknown", "box": box_for_json, "role": None, "image_base_64": None}}
         
    known_encodings = []
    known_user_data = []
    for user in all_users:
        if user.face_encodings:
            for enc_bytes in user.face_encodings:
                known_encodings.append(pickle.loads(enc_bytes))
                known_user_data.append({
                    "name": user.name,
                    "role": user.role,
                    "image_base_64": getattr(user, 'face_image_base64', None)
                })
            
    if not known_encodings:
        return {"status": "UNKNOWN", "message": "Không có dữ liệu khuôn mặt.", "data": {"name": "Unknown", "box": box_for_json, "role": None, "image_base_64": None}}
        
    matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.6)
    face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
    
    if True in matches:
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            matched_user_data = known_user_data[best_match_index]
            return {
                "status": "SUCCESS", "message": "Nhận dạng thành công.",
                "data": {**matched_user_data, "box": box_for_json}
            }

    return {"status": "UNKNOWN", "message": "Không nhận dạng được khuôn mặt.", "data": {"name": "Unknown", "box": box_for_json, "role": None, "image_base_64": None}}

# ---  API ADMIN ---
class AdminRegisterForm(BaseModel):
    name: str
    user_code: str
    email: EmailStr
    role: str
    password: str
    is_super_admin: bool = False

# ENDPOINT MỚI ĐỂ KIỂM TRA SUPER ADMIN CÓ TỒN TẠI KHÔNG
@app.get("/system-admin/setup-status", tags=["Admin Auth"])
async def check_super_admin_exists():
    """Kiểm tra xem đã có super admin nào trong hệ thống chưa. Không cần xác thực."""
    super_admin = await User.find_one(User.is_super_admin == True)
    return {"super_admin_exists": super_admin is not None}

# SỬA LẠI ENDPOINT ĐĂNG KÝ ADMIN
@app.post("/system-admin/register", tags=["Admin Auth"])
async def admin_register_endpoint(
    form_data: AdminRegisterForm,
    # SỬA DÒNG NÀY: Dùng dependency mới để không bị lỗi 401
    current_admin: Optional[User] = Depends(get_optional_current_admin_user)
):
    # Kiểm tra đã có super admin chưa
    super_admin_exists = await User.find_one(User.is_super_admin == True)
    if super_admin_exists:
        # Nếu đã có super admin, yêu cầu xác thực và phải là super admin
        if not current_admin or not current_admin.is_super_admin:
            raise HTTPException(status_code=403, detail="Chỉ super admin mới có quyền tạo admin mới !")
    # Nếu chưa có super admin, cho phép tạo mà không cần xác thực

    if await User.find_one(User.email == form_data.email):
        raise HTTPException(status_code=400, detail="Email admin đã tồn tại")
    if await User.find_one(User.user_code == form_data.user_code):
        raise HTTPException(status_code=400, detail="Mã số đã tồn tại")
        
    hashed_password = get_password_hash(form_data.password)
    new_admin = User(
        name=form_data.name,
        user_code=form_data.user_code,
        email=form_data.email,
        role=form_data.role,
        password=hashed_password,
        is_admin=True,
        is_super_admin=(form_data.role == "super_admin"),
    )
    await new_admin.insert()
    return {"status": "success", "message": f"Tài khoản admin {form_data.name} đã được tạo."}

@app.post("/system-admin/login-form", tags=["Admin Auth"])
async def admin_login_form_endpoint(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username, User.is_admin == True)
    if not user or not user.password or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Thêm role và is_super_admin vào token
    access_token = create_access_token(data={
        "sub": str(user.id),
        "name": user.name,
        "role": user.role,
        "is_super_admin": user.is_super_admin
    })
    return {"access_token": access_token, "token_type": "bearer"}
@app.post("/system-admin/forgot-password", tags=["Admin Auth"])
async def forgot_password(email_body: dict = Body(...)):
    email = email_body.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    user = await User.find_one(User.email == email, User.is_admin == True)
    if not user:
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
    reset_token = create_access_token(
        data={"sub": str(user.id), "scope": "password-reset"},
        expires_delta=timedelta(minutes=15)
    )
    await send_password_reset_email(user.email, reset_token)
    return {"message": "If an account with that email exists, a password reset link has been sent."}

class ResetPasswordForm(BaseModel):
    token: str
    new_password: str

@app.post("/system-admin/reset-password", tags=["Admin Auth"])
async def reset_password(form_data: ResetPasswordForm):
    credentials_exception = HTTPException(status_code=400, detail="Invalid or expired token")
    try:
        payload = jwt.decode(form_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("scope") != "password-reset":
            raise credentials_exception
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await User.get(ObjectId(user_id))
    if not user:
        raise credentials_exception
    
    hashed_password = get_password_hash(form_data.new_password)
    await user.update({"$set": {"password": hashed_password}})
    return {"message": "Password has been reset successfully."}

@app.get("/system-admin/users", response_model=List[AdminUserOut], tags=["Admin Management"])
async def get_all_normal_users(admin: User = Depends(get_current_admin_user)):
    users = await User.find(User.is_admin == False).to_list()
    results = []
    for user in users:
        user_data = user.model_dump()
        user_data["id"] = str(user.id)
        results.append(AdminUserOut(**user_data))
    return results

@app.get("/system-admin/admins", response_model=List[AdminUserOut], tags=["Admin Management"])
async def get_all_admin_users(admin: User = Depends(get_current_admin_user)):
    if not admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Chỉ super admin mới có quyền xem danh sách admin !")
    admins = await User.find(User.is_admin == True).to_list()
    results = []
    for ad in admins:
        user_data = ad.model_dump()
        user_data["id"] = str(ad.id)
        results.append(AdminUserOut(**user_data))
    return results

@app.put("/system-admin/users/{user_id}", response_model=AdminUserOut, tags=["Admin Management"])
async def update_user_by_admin(user_id: str, user_update: UserUpdate, admin: User = Depends(get_current_admin_user)):
    user_to_update = await User.get(ObjectId(user_id))
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    if "user_code" in update_data and await User.find_one(User.user_code == update_data["user_code"], User.id != user_to_update.id):
        raise HTTPException(status_code=400, detail="User code already exists")
    if "email" in update_data and await User.find_one(User.email == update_data["email"], User.id != user_to_update.id):
        raise HTTPException(status_code=400, detail="Email already exists")

    await user_to_update.update({"$set": update_data})
    
    updated_user = await User.get(ObjectId(user_id))
    
    updated_user_data = updated_user.model_dump()
    updated_user_data["id"] = str(updated_user.id)
    
    return AdminUserOut(**updated_user_data)

@app.delete("/system-admin/users/{user_id}", tags=["Admin Management"])
async def delete_user_by_admin(user_id: str, admin: User = Depends(get_current_admin_user)):
    user_to_delete = await User.get(ObjectId(user_id))
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_delete.id == admin.id:
        raise HTTPException(status_code=403, detail="Admins cannot delete their own account.")

    await user_to_delete.delete()
    return {"status": "success", "message": f"User {user_to_delete.name} deleted"}

@app.delete("/system-admin/admins/{admin_id}", tags=["Admin Management"])
async def delete_admin_by_super_admin(admin_id:str, current_admin:User =Depends(get_current_admin_user)):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Chỉ super admin mới có quyền xóa admin !")
    admin_to_delete=await User.get(ObjectId(admin_id))
    if not admin_to_delete:
        raise HTTPException(status_code=404, detail="Admin not found")
    if admin_to_delete.id == current_admin.id:
        raise HTTPException(status_code=403,detail="Super admin not delete their own account")
    await admin_to_delete.delete()
    return {"status":"success","message":f"Admin {admin_to_delete.name} deleted"}

@app.put("/system-admin/admins/{admin_id}", response_model=AdminUserOut, tags=["Admin Management"])
async def update_admin_by_super_admin(admin_id: str, user_update: UserUpdate, current_admin: User = Depends(get_current_admin_user)):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Chỉ super admin mới được phép sửa thông tin admin.")
    admin_to_update = await User.get(ObjectId(admin_id))
    if not admin_to_update or not admin_to_update.is_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    if "user_code" in update_data and await User.find_one(User.user_code == update_data["user_code"], User.id != admin_to_update.id):
        raise HTTPException(status_code=400, detail="User code already exists")
    if "email" in update_data and await User.find_one(User.email == update_data["email"], User.id != admin_to_update.id):
        raise HTTPException(status_code=400, detail="Email already exists")
    await admin_to_update.update({"$set": update_data})
    updated_admin = await User.get(ObjectId(admin_id))
    updated_admin_data = updated_admin.model_dump()
    updated_admin_data["id"] = str(updated_admin.id)
    return AdminUserOut(**updated_admin_data)

# --- event
# @app.post("/event-users/add", tags=["Event"])
# async def add_event_user(
#     name: str = Form(...),
#     email: str = Form(None),
#     role: str = Form(None),
#     company: str = Form(None),
#     position: str = Form(None),
#     file: UploadFile = File(...)
# ):
#     image_bytes = await file.read()
#     image_base64 = base64.b64encode(image_bytes).decode('utf-8')
#     new_event_user = EventUser(
#         name=name,
#         email=email,
#         role=role,
#         company=company,
#         position=position,
#         face_image_base64=image_base64
#     )
#     await new_event_user.insert()
#     return {"status": "success", "message": f"Thêm thành công {name} vào sự kiện!"}
@app.post("/event-users/add", tags=["Event"])
async def add_event_user(
    name: str = Form(...),
    email: str = Form(None),
    role: str = Form(None),
    company: str = Form(None),
    position: str = Form(None),
    file: UploadFile = File(...)
):
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    image = bytes_to_cv2_img(image_bytes)
    face_locations = detect_faces_opencv(image)
    if not face_locations or len(face_locations) != 1:
        raise HTTPException(status_code=400, detail="Ảnh phải có đúng 1 khuôn mặt rõ ràng!")
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_image, face_locations)
    if not encodings:
        raise HTTPException(status_code=400, detail="Không thể lấy encoding khuôn mặt!")
    face_encoding = base64.b64encode(pickle.dumps(encodings[0])).decode('utf-8')
    new_event_user = EventUser(
        name=name,
        email=email,
        role=role,
        company=company,
        position=position,
        face_image_base64=image_base64,
        face_encoding=face_encoding
    )
    await new_event_user.insert()
    return {"status": "success", "message": f"Thêm thành công {name} vào sự kiện!"}
@app.get("/event-users", tags=["Event"])
async def get_event_users():
    users = await EventUser.find_all().to_list()
    for user in users:
        if hasattr(user, 'id'):
           user._id= str (user.id)
    return users

# SỬA NGƯỜI THAM DỰ SỰ KIỆN
@app.put("/event-users/{user_id}", tags=["Event"])
async def update_event_user(
    user_id: str = ApiPath(...),
    name: str = Form(...),
    email: str = Form(None),
    role: str = Form(None),
    company: str = Form(None),
    position: str = Form(None),
    file: UploadFile = File(None)
):
    user = await EventUser.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Event user not found")
    update_data = {
        "name": name,
        "email": email,
        "role": role,
        "company": company,
        "position": position
    }
    if file:
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        update_data["face_image_base64"] = image_base64
    await user.update({"$set": update_data})
    updated_user = await EventUser.get(ObjectId(user_id))
    return updated_user

# XÓA NGƯỜI THAM DỰ SỰ KIỆN
@app.delete("/event-users/{user_id}", tags=["Event"])
async def delete_event_user(user_id: str = ApiPath(...)):
    user = await EventUser.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Event user not found")
    await user.delete()
    return {"status": "success", "message": f"Đã xóa người tham dự {user.name}"}
# post

@app.post("/event-recognize", tags=["Event"])
async def event_recognize(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    face_locations = detect_faces_opencv(image)
    if not face_locations:
        return {"status": "NO_FACE", "message": "Không tìm thấy khuôn mặt nào.", "data": None}
    if len(face_locations) > 1:
        return {"status": "MULTIPLE_FACES", "message": "Phát hiện nhiều hơn một khuôn mặt.", "data": None}
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    unknown_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
    box = face_locations[0]
    box_for_json = tuple(map(int, box))
    all_users = await EventUser.find(EventUser.face_encoding != None).to_list()
    known_encodings = []
    known_user_data = []
    for user in all_users:
        if user.face_encoding:
            # Sử dụng encoding đã lưu
            known_encodings.append(pickle.loads(base64.b64decode(user.face_encoding)))
            known_user_data.append({
                "name": user.name,
                "role": user.role,
                "image_base_64": user.face_image_base64
            })
    if not known_encodings:
        return {"status": "UNKNOWN", "message": "Không có dữ liệu khuôn mặt.", "data": {"name": "Unknown", "box": box_for_json, "role": None, "image_base_64": None}}
    matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.6)
    face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
    if True in matches:
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            matched_user_data = known_user_data[best_match_index]
            return {
                "status": "SUCCESS", "message": "Nhận diện thành công.",
                "data": {**matched_user_data, "box": box_for_json}
            }
    return {"status": "UNKNOWN", "message": "Không nhận diện được khuôn mặt.", "data": {"name": "Unknown", "box": box_for_json, "role": None, "image_base_64": None}}