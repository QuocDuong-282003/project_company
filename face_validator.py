import cv2
import numpy as np
import face_recognition

def analyze_face(image:np.ndarray):
    height, width, _ = image.shape
    image_center_x , image_center_y = width // 2, height // 2
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations= face_recognition.face_locations(rgb_image)
    if not face_locations:
        return {"status":"ERROR", 'message':'không tìm thấy khuôn mặt !'}
    if len(face_locations) >1:
        return {"status":"ERROR", 'message':'Phát hiện nhiều hơn 1 khuôn mặt !'}
    top, right, bottom, left= face_locations[0]
    face_center_x= (left +right)//2
    face_center_y=(top+bottom)//2

    offset_x = abs(face_center_x - image_center_x)
    offset_y = abs(face_center_y - image_center_y)

    if offset_x > width * 0.2 or offset_y > height *0.2:
        return {"status":"ERROR", 'message':'Vui lòng di chuyển khuôn mặt vào giữa khung hình !'}
    
    landmarks= face_recognition.face_landmarks(rgb_image, face_locations)[0]
    left_eye =landmarks['left_eye']
    right_eye= landmarks['right_eye']
    left_eye_center= np.mean(left_eye, axis=0).astype(int)
    right_eye_center= np.mean(right_eye, axis=0).astype(int)
    dy = right_eye_center[1] - left_eye_center[1]
    dx = right_eye_center[0] - left_eye_center[0]
    angle = np.degrees(np.arctan2(dy, dx))
    if abs(angle) > 10:
        return {"status": "ERROR", "message": f"Vui lòng giữ thẳng mặt (độ nghiêng: {angle:.1f}°)"}
    face_width = right - left
    if face_width < width * 0.2:
        return {"status": "ERROR", "message": "Vui lòng đến gần camera hơn"}
    return {"status": "OK", "message": "Khuôn mặt hợp lệ!"}