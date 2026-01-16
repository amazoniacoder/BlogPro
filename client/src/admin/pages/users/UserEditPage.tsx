// Simple test component
import React from "react";
import { useParams, useLocation } from "wouter";

const UserEditPage: React.FC = () => {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const [, navigate] = useLocation();

  return (
    <div className="admin-section">
      <h1>Edit User</h1>
      <p>This is a test component to verify routing.</p>
      <p>User ID: {userId}</p>
      <button onClick={() => navigate("/admin/users")}>Back to Users</button>
    </div>
  );
};

export default UserEditPage;
