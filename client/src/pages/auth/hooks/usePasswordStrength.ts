// D:\WebDesignStudio\client\src\pages\auth\hooks\usePasswordStrength.ts
import { useState, useEffect } from "react";

interface PasswordStrengthResult {
  score: number; // 0-5 score (0 = empty, 5 = very strong)
  label: string; // Text label (Weak, Medium, Strong)
  color: string; // CSS color variable
  isStrong: boolean; // Whether password meets minimum strength requirements
  feedback: string[]; // Suggestions for improvement
}

export const usePasswordStrength = (
  password: string
): PasswordStrengthResult => {
  const [result, setResult] = useState<PasswordStrengthResult>({
    score: 0,
    label: "",
    color: "",
    isStrong: false,
    feedback: [],
  });

  useEffect(() => {
    // Don't evaluate empty passwords
    if (!password) {
      setResult({
        score: 0,
        label: "",
        color: "",
        isStrong: false,
        feedback: [],
      });
      return;
    }

    // Calculate score based on various criteria
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length < 8) {
      feedback.push("Use at least 8 characters");
    } else {
      score += 1;
    }

    // Uppercase letters
    if (!/[A-Z]/.test(password)) {
      feedback.push("Add uppercase letters");
    } else {
      score += 1;
    }

    // Lowercase letters
    if (!/[a-z]/.test(password)) {
      feedback.push("Add lowercase letters");
    } else {
      score += 1;
    }

    // Numbers
    if (!/[0-9]/.test(password)) {
      feedback.push("Add numbers");
    } else {
      score += 1;
    }

    // Special characters
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push("Add special characters");
    } else {
      score += 1;
    }

    // Determine label and color based on score
    let label = "";
    let color = "";
    let isStrong = false;

    if (score <= 2) {
      label = "Weak";
      color = "var(--color-error)";
      isStrong = false;
    } else if (score <= 3) {
      label = "Medium";
      color = "var(--color-warning)";
      isStrong = false;
    } else if (score === 4) {
      label = "Strong";
      color = "var(--color-success)";
      isStrong = true;
    } else {
      label = "Very Strong";
      color = "var(--color-success)";
      isStrong = true;
    }

    setResult({
      score,
      label,
      color,
      isStrong,
      feedback,
    });
  }, [password]);

  return result;
};
