/**
 * BlogPro Profile Form Pattern
 * Universal profile editing form component
 */

import React, { useState } from 'react';
import { Card, FormField, Input, Textarea, Button, FileUpload, Heading, Text } from '../components';

export interface ProfileData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar?: string;
  website?: string;
  location?: string;
}

export interface ProfileFormProps {
  initialData: ProfileData;
  onSubmit: (data: ProfileData) => void;
  onAvatarUpload?: (file: File) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onAvatarUpload,
  loading = false,
  error,
  className = ''
}) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (files: FileList | null) => {
    if (files && files[0] && onAvatarUpload) {
      onAvatarUpload(files[0]);
    }
  };

  return (
    <Card className={`bp-profile-form ${className}`}>
      <div className="profile-form__header">
        <Heading level={2}>Edit Profile</Heading>
        <Text color="secondary">
          Update your profile information and settings.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="profile-form__form">
        {error && (
          <div className="profile-form__error">
            <Text color="error">{error}</Text>
          </div>
        )}

        <div className="profile-form__avatar-section">
          <div className="profile-form__avatar">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile" />
            ) : (
              <div className="profile-form__avatar-placeholder">
                {formData.firstName?.[0] || formData.username?.[0] || '?'}
              </div>
            )}
          </div>
          
          <FileUpload
            accept="image/*"
            onFileSelect={handleAvatarUpload}
            className="profile-form__avatar-upload"
          >
            <Text size="sm">Click to upload new avatar</Text>
          </FileUpload>
        </div>

        <div className="profile-form__row">
          <FormField label="First Name" required>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="First name"
              required
            />
          </FormField>

          <FormField label="Last Name" required>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Last name"
              required
            />
          </FormField>
        </div>

        <FormField label="Username" required>
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="Username"
            required
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
            required
          />
        </FormField>

        <div className="profile-form__row">
          <FormField label="Website">
            <Input
              type="url"
              value={formData.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </FormField>

          <FormField label="Location">
            <Input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </FormField>
        </div>

        <FormField label="Bio">
          <Textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </FormField>

        <div className="profile-form__actions">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileForm;
