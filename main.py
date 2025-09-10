
import base64
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import pickle
import face_recognition
from typing import List
from .database import init_db
from .odm_models import User
from .schemas import UserOut
from .face_validator import analyze_face

app = FastAPI(title="Face Recognition API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def on_startup():
    await init_db()

def bytes_to_cv2_img(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.post("/validate-face")
async def validate_face_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    return analyze_face(image)

@app.post("/register")
async def register_endpoint(
    name: str = Form(...),
    user_code: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    file: UploadFile = File(...)
):
    # Kiểm tra mã số hoặc email đã tồn tại chưa
    if await User.find_one(User.user_code == user_code):
        raise HTTPException(status_code=400, detail="Mã số đã tồn tại")
    if await User.find_one(User.email == email):
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    new_face_encodings = face_recognition.face_encodings(rgb_image)
    if not new_face_encodings:
        raise HTTPException(status_code=400, detail="Không tìm thấy khuôn mặt trong ảnh để đăng ký")
    
    new_face_encoding = new_face_encodings[0]

    # === LOGIC KIỂM TRA KHUÔN MẶT TRÙNG LẶP ===
    all_users = await User.find_all().to_list()
    if all_users:
        existing_encodings = []
        for user in all_users:
            for enc_bytes in user.face_encodings:
                existing_encodings.append(pickle.loads(enc_bytes))
        
        if existing_encodings:
            matches = face_recognition.compare_faces(existing_encodings, new_face_encoding, tolerance=0.5)
            if True in matches:
                raise HTTPException(status_code=400, detail="Khuôn mặt này đã được đăng ký cho một tài khoản khác.")
    # === KẾT THÚC LOGIC KIỂM TRA ===

    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    encoding_bytes = pickle.dumps(new_face_encoding)
    
    # Thêm các trường mới vào User
    new_user = User(
        name=name,
        user_code=user_code,
        email=email,
        role=role,
        face_encodings=[encoding_bytes],
        face_image_base64=image_base64
    )
    await new_user.insert()
    return {"status": "success", "message": f"Đăng ký thành công cho {name}!"}


@app.post("/login-recognize")
async def login_recognize_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = bytes_to_cv2_img(image_bytes)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_image)
    
    # KIỂM TRA SỐ LƯỢNG KHUÔN MẶT
    if not face_locations:
        return {"name": "Unknown", "box": None, "role": None, "image_base64": None}
    if len(face_locations) > 1:
        # Nếu có nhiều hơn 1 khuôn mặt, trả về lỗi
        return {"name": "Error: Multiple Faces", "box": None, "role": None, "image_base64": None}

    unknown_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
    box = face_locations[0]
    
    all_users = await User.find_all().to_list()
    if not all_users:
         return {"name": "Unknown", "box": box, "role": None, "image_base64": None}

    known_encodings = []
    known_user_data = [] # Sẽ lưu {name, role, image_base64}
    for user in all_users:
        for enc_bytes in user.face_encodings:
            known_encodings.append(pickle.loads(enc_bytes))
            known_user_data.append({"name": user.name, "role": user.role, "image_base64": user.face_image_base64})
            
    if not known_encodings:
        return {"name": "Unknown", "box": box, "role": None, "image_base64": None}

    matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.5)
    face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
    best_match_index = np.argmin(face_distances)
    
    # Khởi tạo giá trị mặc định
    name = "Unknown"
    role = None
    image_base64 = None
    
    if matches[best_match_index]:
        # Lấy dữ liệu từ user khớp nhất
        matched_user_data = known_user_data[best_match_index]
        name = matched_user_data["name"]
        role = matched_user_data["role"]
        image_base64 = matched_user_data["image_base64"]

    return {"name": name, "box": box, "role": role, "image_base64": image_base64}


@app.get("/dashboard/stats")
async def stats_endpoint():
    user_count = await User.count()
    return {"total_users": user_count}

@app.get("/users", response_model=List[UserOut])
async def users_endpoint():
    users = await User.find_all(projection_model=UserOut).to_list()
    return users