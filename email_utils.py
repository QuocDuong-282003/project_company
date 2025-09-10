# backend/email_utils.py
import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587")) 

async def send_password_reset_email(recipient_email: str, reset_token: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Yêu cầu đặt lại mật khẩu"
    message["From"] = EMAIL_HOST_USER
    message["To"] = recipient_email

    reset_url = f"http://localhost:5173/system-admin/reset-password?token={reset_token}"
    
    html_content = f"""
    <html>
        <body>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây để tiếp tục:</p>
            <a href="{reset_url}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        </body>
    </html>
    """
    
    message.attach(MIMEText(html_content, "html"))

    try:
        if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD]):
            print("Lỗi: Vui lòng cấu hình đầy đủ các biến môi trường cho email trong file .env")
            return

        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_HOST_USER,
            password=EMAIL_HOST_PASSWORD,
            start_tls=True
        )
        print(f"Password reset email sent to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")