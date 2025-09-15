import cv2
import numpy as np
import face_recognition

# Import hàm phát hiện khuôn mặt mới của chúng ta từ face_detector
from .face_detector import detect_faces_opencv

def analyze_face(image: np.ndarray):
    height, width, _ = image.shape
    image_center_x, image_center_y = width // 2, height // 2
    
    # Sử dụng hàm detect_faces_opencv thay vì face_locations của dlib
    face_locations = detect_faces_opencv(image)
    
    if not face_locations:
        return {"status": "ERROR", 'message': 'Không tìm thấy khuôn mặt!'}
    if len(face_locations) > 1:
        return {"status": "ERROR", 'message': 'Phát hiện nhiều hơn 1 khuôn mặt!'}
        
    top, right, bottom, left = face_locations[0]
    face_center_x = (left + right) // 2
    face_center_y = (top + bottom) // 2

    offset_x = abs(face_center_x - image_center_x)
    offset_y = abs(face_center_y - image_center_y)

    if offset_x > width * 0.35 or offset_y > height * 0.35:
        return {"status": "ERROR", 'message': 'Vui lòng di chuyển khuôn mặt vào giữa khung hình!'}
    
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    landmarks = face_recognition.face_landmarks(rgb_image, face_locations)
    
    if not landmarks:
        return {"status": "ERROR", "message": "Không thể phân tích đặc điểm khuôn mặt."}
        
    landmarks = landmarks[0]
    left_eye = landmarks['left_eye']
    right_eye = landmarks['right_eye']
    left_eye_center = np.mean(left_eye, axis=0).astype(int)
    right_eye_center = np.mean(right_eye, axis=0).astype(int)
    
    dy = right_eye_center[1] - left_eye_center[1]
    dx = right_eye_center[0] - left_eye_center[0]
    angle = np.degrees(np.arctan2(dy, dx))
    
    if abs(angle) > 25:
        return {"status": "ERROR", "message": f"Vui lòng giữ thẳng mặt hơn (độ nghiêng: {angle:.1f}°)"}
        
    face_width = right - left
    if face_width < width * 0.20:
        return {"status": "ERROR", "message": "Vui lòng đến gần camera hơn"}
        
    return {"status": "OK", "message": "Khuôn mặt hợp lệ!"}