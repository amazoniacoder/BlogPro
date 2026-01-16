import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/ui-system/icons/components";
import type { User } from "@/admin/pages/users/state/types";

interface UsersFormProps {
  onSubmit: (userData: any) => void;
  onCancel: () => void;
  initialData?: Partial<User>;
  isEditing?: boolean;
  onVerifyEmail?: (userId: string) => void;
}

const UsersForm: React.FC<UsersFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
  onVerifyEmail,
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    status: "active",
    isActive: true,
    password: "",
    confirmPassword: "",
    profileImageUrl: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        role: initialData.role || "user",
        status: initialData.status || (!initialData.isBlocked ? "active" : "inactive"),
        isActive: !initialData.isBlocked,
        password: "",
        confirmPassword: "",
        profileImageUrl: initialData.profileImageUrl || "",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
        status: "active",
        isActive: true,
        password: "",
        confirmPassword: "",
        profileImageUrl: "",
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
        status: checked ? "active" : "inactive",
      });
    } else {
      const newFormData = {
        ...formData,
        [name]: value,
      };
      
      if (name === "password" && isEditing) {
        newFormData.confirmPassword = value;
      }
      
      setFormData(newFormData);
    }
  };

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(webpFile);
            } else {
              reject(new Error('Failed to convert image to WebP'));
            }
          },
          'image/webp',
          0.8
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      
      try {
        const webpFile = await convertToWebP(originalFile);
        setImageFile(webpFile);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({
            ...formData,
            profileImageUrl: previewUrl
          });
        };
        
        img.src = URL.createObjectURL(webpFile);
      } catch (error) {
        console.error('Error converting image to WebP:', error);
        setImageFile(originalFile);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({
            ...formData,
            profileImageUrl: previewUrl
          });
        };
        
        img.src = URL.createObjectURL(originalFile);
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t('admin:usernameRequired', { defaultValue: 'Username is required' });
    }

    if (!formData.email.trim()) {
      newErrors.email = t('admin:emailRequired', { defaultValue: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('admin:emailInvalid', { defaultValue: 'Email is invalid' });
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = t('admin:passwordRequired', { defaultValue: 'Password is required' });
      } else if (formData.password.length < 8) {
        newErrors.password = t('admin:passwordMinLength', { defaultValue: 'Password must be at least 8 characters' });
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('admin:passwordsDoNotMatch', { defaultValue: 'Passwords do not match' });
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = t('admin:passwordMinLength', { defaultValue: 'Password must be at least 8 characters' });
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('admin:passwordsDoNotMatch', { defaultValue: 'Passwords do not match' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const { confirmPassword, ...dataToSubmit } = formData;
      
      let finalDataToSubmit: any = dataToSubmit;
      if (isEditing && !dataToSubmit.password) {
        const { password, ...dataWithoutPassword } = dataToSubmit;
        finalDataToSubmit = dataWithoutPassword;
      }
      
      if (imageFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', imageFile);
          
          const response = await fetch('/api/media', {
            method: 'POST',
            body: uploadFormData,
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const result = await response.json();
          
          if (result.url) {
            finalDataToSubmit.profileImageUrl = result.url;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      } else if (formData.profileImageUrl && !formData.profileImageUrl.startsWith('data:')) {
        finalDataToSubmit.profileImageUrl = formData.profileImageUrl;
      }
      
      onSubmit(finalDataToSubmit);
    }
  };

  return (
    <div className="admin-users__form-container">
      <div className="admin-users__form-header">
        <h2 className="admin-users__form-title">
          {isEditing 
            ? t('admin:editUser', { defaultValue: 'Редактировать пользователя' })
            : t('admin:createNewUser', { defaultValue: 'Создать нового пользователя' })
          }
        </h2>
      </div>

      <form className="admin-users__form" onSubmit={handleSubmit}>
        <div className="admin-users__form-group">
          <label htmlFor="username" className="admin-users__form-label">
            {t('admin:username', { defaultValue: 'Username' })} <span className="admin-users__form-required">*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`admin-users__form-input ${errors.username ? "admin-users__form-input--error" : ""}`}
            required
          />
          {errors.username && (
            <div className="admin-users__form-error">{errors.username}</div>
          )}
        </div>

        <div className="admin-users__form-group">
          <label htmlFor="email" className="admin-users__form-label">
            {t('admin:email', { defaultValue: 'Email' })} <span className="admin-users__form-required">*</span>
          </label>
          <div className="admin-users__email-container">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`admin-users__form-input ${errors.email ? "admin-users__form-input--error" : ""}`}
              required
            />
            {isEditing && initialData?.id && !initialData?.emailVerified && (
              <button
                type="button"
                className="admin-users__form-button admin-users__form-button--secondary"
                onClick={() => onVerifyEmail?.(initialData.id!)}
                title={t('admin:verifyEmail', { defaultValue: 'Verify email address' })}
              >
                <Icon name="check" size={16} />
                {t('admin:verifyEmail', { defaultValue: 'Verify Email' })}
              </button>
            )}
          </div>
          {errors.email && (
            <div className="admin-users__form-error">{errors.email}</div>
          )}
          {isEditing && initialData?.emailVerified === false && (
            <div className="admin-users__form-hint">
              ⚠️ {t('admin:emailNotVerified', { defaultValue: 'Email not verified - user cannot log in' })}
            </div>
          )}
          {isEditing && initialData?.emailVerified === true && (
            <div className="admin-users__form-hint">
              ✅ {t('admin:emailVerified', { defaultValue: 'Email verified' })}
            </div>
          )}
        </div>

        <div className="admin-users__form-group">
          <label htmlFor="firstName" className="admin-users__form-label">
            {t('admin:firstName', { defaultValue: 'First Name' })}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="admin-users__form-input"
          />
        </div>

        <div className="admin-users__form-group">
          <label htmlFor="lastName" className="admin-users__form-label">
            {t('admin:lastName', { defaultValue: 'Last Name' })}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="admin-users__form-input"
          />
        </div>

        <div className="admin-users__form-group">
          <label htmlFor="role" className="admin-users__form-label">
            {t('admin:role', { defaultValue: 'Role' })}
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="admin-users__form-select"
          >
            <option value="admin">{t('admin:adminRole', { defaultValue: 'Admin' })}</option>
            <option value="editor">{t('admin:editorRole', { defaultValue: 'Editor' })}</option>
            <option value="user">{t('admin:userRole', { defaultValue: 'User' })}</option>
          </select>
        </div>

        <div className="admin-users__form-group">
          <div className="admin-users__form-checkbox">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="admin-users__form-checkbox-input"
            />
            <label htmlFor="isActive" className="admin-users__form-checkbox-label">
              {t('admin:activeAccount', { defaultValue: 'Active Account' })}
            </label>
          </div>
        </div>

        <div className="admin-users__form-group">
          <label htmlFor="password" className="admin-users__form-label">
            {t('admin:password', { defaultValue: 'Password' })} {!isEditing && <span className="admin-users__form-required">*</span>}
          </label>
          <input
            type={isEditing ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`admin-users__form-input ${errors.password ? "admin-users__form-input--error" : ""}`}
            required={!isEditing}
            placeholder={isEditing ? t('admin:leaveEmptyToKeep', { defaultValue: 'Leave empty to keep current password' }) : ""}
          />
          {errors.password && (
            <div className="admin-users__form-error">{errors.password}</div>
          )}
          {isEditing && (
            <div className="admin-users__form-hint">
              {t('admin:passwordHint', { defaultValue: 'Leave empty to keep current password, or enter new password to change it.' })}
            </div>
          )}
        </div>

        {(!isEditing || formData.password) && (
          <div className="admin-users__form-group">
            <label htmlFor="confirmPassword" className="admin-users__form-label">
              {t('admin:confirmPassword', { defaultValue: 'Confirm Password' })} {!isEditing && <span className="admin-users__form-required">*</span>}
            </label>
            <input
              type={isEditing ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`admin-users__form-input ${errors.confirmPassword ? "admin-users__form-input--error" : ""}`}
              required={!isEditing || !!formData.password}
              placeholder={isEditing ? t('admin:confirmNewPassword', { defaultValue: 'Confirm new password' }) : ""}
            />
            {errors.confirmPassword && (
              <div className="admin-users__form-error">{errors.confirmPassword}</div>
            )}
          </div>
        )}
        
        <div className="admin-users__form-group admin-users__form-group--full">
          <label htmlFor="profileImage" className="admin-users__form-label">
            {t('admin:profileImage', { defaultValue: 'Profile Image' })}
          </label>
          <div className="admin-users__avatar-container">
            <div className="admin-users__avatar-preview">
              <div className="admin-users__avatar admin-users__avatar--large">
                {formData.profileImageUrl ? (
                  <img 
                    src={formData.profileImageUrl} 
                    alt="Profile" 
                    className="admin-users__avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.classList.add('admin-users__avatar--placeholder');
                        e.currentTarget.parentElement.textContent = (formData.firstName?.[0] || "U").toUpperCase();
                      }
                    }}
                  />
                ) : (
                  <div className="admin-users__avatar-placeholder">
                    {(formData.firstName?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="profileImage" className="admin-users__avatar-upload">
                <Icon name="upload" size={16} />
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="admin-users__avatar-input"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="admin-users__form-actions">
          <button
            type="button"
            className="admin-users__form-button admin-users__form-button--secondary"
            onClick={onCancel}
          >
            <Icon name="x" size={16} />
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </button>
          <button type="submit" className="admin-users__form-button admin-users__form-button--primary">
            <Icon name={isEditing ? "check" : "add"} size={16} />
            {isEditing 
              ? t('admin:updateUser', { defaultValue: 'Update User' })
              : t('admin:createUser', { defaultValue: 'Create User' })
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsersForm;
