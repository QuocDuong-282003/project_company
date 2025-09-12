
import React, { useState } from "react";
import apiClient from "../api/apiClient";
import Step3Confirm from "../components/Step3_Confirm";
import Step1UserInfo from "../components/Step1_UserInfo";
import Step2FaceCapture from "../components/Step2_FaceCapture";

const RegistrationPage = () => {
    const [step, setStep] = useState(1);

    // Định nghĩa trạng thái ban đầu để dễ dàng reset form
    const initialFormData = {
        name: '',
        user_code: '',
        email: '',
        role: '',
        capturedImage: null,
    };

    const [formData, setFormData] = useState(initialFormData);

    const nextStep = () => {
        setStep(prev => prev + 1);
    }
    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleUserInfoSumbit = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
        nextStep();
    }

    const handleFaceCapture = (imageSrc) => {
        setFormData(prev => ({ ...prev, capturedImage: imageSrc }));
        nextStep();
    }

    const handleFinalSubmit = async () => {
        const { user_code, name, email, role, capturedImage } = formData;

        const blob = await fetch(capturedImage).then(res => res.blob());
        const file = new File([blob], `${user_code}.jpg`, { type: 'image/jpeg' });

        const submissionData = new FormData();
        submissionData.append('name', name);
        submissionData.append('user_code', user_code);
        submissionData.append('email', email);
        submissionData.append('role', role);
        submissionData.append('file', file);

        try {
            // Gửi yêu cầu đăng ký
            const response = await apiClient.post('/register', submissionData);
            alert(response.data.message);


            setStep(1);
            setFormData(initialFormData);

        } catch (error) {

            alert('Đăng ký thất bại: ' + (error.response?.data?.detail || error.message));


            setStep(1);
            setFormData(initialFormData);
        }
    };

    switch (step) {
        case 1:
            return <Step1UserInfo onNext={handleUserInfoSumbit} initialData={formData} />;
        case 2:
            return <Step2FaceCapture onCapture={handleFaceCapture} onBack={prevStep} />;
        case 3:
            return <Step3Confirm formData={formData} onBack={prevStep} onSubmit={handleFinalSubmit} />;
        default:
            return <div>Đang tải lại trang đăng ký...</div>;
    }
}

export default RegistrationPage;