import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { FormField } from "@/ui-system/components/form";
import { PasswordInput } from "@/ui-system/components/input";
import { Button } from "@/ui-system/components/button";
import { Heading, Text } from "@/ui-system/components/typography";
import { Card } from "@/ui-system/components/card";
import { useNotification } from "@/ui-system/components/feedback";
import { authService } from "@/services/api/auth";

export default function ResetPasswordPage() {
  const [match, params] = useRoute("/reset-password/:token");
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showSuccess, showError } = useNotification();

  const token = params?.token;

  useEffect(() => {
    if (!match || !token) {
      navigate("/auth");
    }
  }, [match, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      showError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token!, password);
      setSuccess(true);
      showSuccess("Password reset successfully! You can now login with your new password.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
          <Heading level={2}>Password Reset Complete</Heading>
          <Text>
            Your password has been successfully reset. You can now login with your new password.
          </Text>
          <Button onClick={handleBackToLogin}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (!match || !token) {
    return null;
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ maxWidth: '500px', padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <Heading level={2} className="text-center">Set New Password</Heading>
          <Text className="text-center">
            Enter your new password below.
          </Text>

          <FormField label="New Password" required>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Confirm Password" required>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormField>

          <Button 
            type="submit" 
            variant="primary"
            size="lg"
            disabled={loading || !password || !confirmPassword}
            className="auth-form__button"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <Button 
            type="button"
            variant="ghost"
            onClick={handleBackToLogin}
            className="auth-form__button"
          >
            Back to Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
