# Sử dụng một base image Python chính thức.
# 'slim-buster' là một phiên bản nhẹ của Debian, tốt cho sản phẩm.
FROM python:3.9-slim-buster

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Cài đặt các dependencies hệ thống cần thiết cho dlib và OpenCV
# Đây là bước quan trọng nhất mà Docker giải quyết cho bạn!
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements trước để tận dụng Docker layer caching
# Nếu file này không đổi, Docker sẽ không cần cài lại thư viện, giúp build nhanh hơn
COPY requirements.txt .

# Cài đặt các thư viện Python
# --no-cache-dir để giữ cho image size nhỏ hơn
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code của dự án vào thư mục làm việc trong container
COPY . .

# Lệnh để chạy ứng dụng của bạn khi container khởi động
# Thay "main:app" nếu file chính hoặc biến FastAPI của bạn có tên khác
# --host 0.0.0.0 là bắt buộc để có thể truy cập từ bên ngoài container
# --port 10000 là port mà ứng dụng sẽ lắng nghe bên trong container. Render sẽ tự động map port bên ngoài vào đây.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]