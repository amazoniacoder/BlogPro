/**
 * BlogPro Contact Form Pattern
 * Contact form with validation and captcha
 */

import { useState } from 'react';
import { useNotification } from '@/ui-system/components/feedback';
import { CaptchaButton } from '@/plugins/captcha';
import './contact-form.css';

export interface ContactFormProps {
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleCaptchaSolved = (_token: string) => {
    setCaptchaVerified(true);
  };
  
  const handleCaptchaError = (error: string) => {
    showError(`Captcha error: ${error}`);
    setCaptchaVerified(false);
  };
  const { showError, showSuccess } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      showError('Please verify the captcha');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccess('Message sent successfully! We will get back to you soon.');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
        setCaptchaVerified(false);
      } else {
        showError('Failed to send message. Please try again.');
      }
    } catch (error) {
      showError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={`contact-form ${className}`}>
      <div className="contact-form__field">
        <label className="contact-form__label">First Name <span className="required-field">*</span></label>
        <input
          type="text"
          name="firstName"
          className="contact-form__input"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label">Last Name</label>
        <input
          type="text"
          name="lastName"
          className="contact-form__input"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label">Email <span className="required-field">*</span></label>
        <input
          type="email"
          name="email"
          className="contact-form__input"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label">Message <span className="required-field">*</span></label>
        <textarea
          name="message"
          className="contact-form__textarea"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label">Verification <span className="required-field">*</span></label>
        <div className="contact-form__submit-section">
          <div className="contact-form__captcha">
            <CaptchaButton onSolved={handleCaptchaSolved} onError={handleCaptchaError} />
          </div>
          <button 
            type="submit" 
            className="contact-form__submit"
            disabled={loading || !captchaVerified}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
