"use client";
import RegisterForm from "@/components/RegisterForm";
import Welcome from "@/components/Welcome";
import { useState } from "react";

function Register() {
  const [step, setStep] = useState(1);
  return (
    <div>
      {step === 1 ? (
        <Welcome setStep={setStep} />
      ) : (
        <RegisterForm setStep={setStep} />
      )}
    </div>
  );
}

export default Register;
