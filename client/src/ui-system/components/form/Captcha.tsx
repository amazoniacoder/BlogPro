/**
 * BlogPro Captcha Component
 * Simple math captcha for form verification
 */

import React, { useState, useEffect } from 'react';

export interface CaptchaProps {
  onVerify?: (isValid: boolean) => void;
  className?: string;
}

const Captcha: React.FC<CaptchaProps> = ({
  onVerify,
  className = ''
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setMessage('');
    setIsVerified(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    
    setIsVerified(isCorrect);
    setMessage(isCorrect ? 'Verified!' : 'Incorrect, try again');
    onVerify?.(isCorrect);
    
    if (!isCorrect) {
      generateCaptcha();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
    setMessage('');
  };

  const captchaClasses = [
    'captcha',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={captchaClasses}>
      <div className="captcha__display">
        <div className="captcha__code font-bold">
          {num1} + {num2}
        </div>
        <button
          type="button"
          className="captcha__refresh text-secondary"
          onClick={generateCaptcha}
          title="Refresh captcha"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>
      
      <div className="captcha__input-group">
        <input
          type="number"
          className={`captcha__input ${message && !isVerified ? 'captcha__input--error' : ''}`}
          value={userAnswer}
          onChange={handleInputChange}
          placeholder="?"
          min="0"
          max="18"
        />
        <button
          type="button"
          className="captcha__verify"
          onClick={handleVerify}
          disabled={!userAnswer}
        >
          OK
        </button>
      </div>
      
      {message && (
        <div className={`captcha__message text-secondary ${isVerified ? 'captcha__message--success' : 'captcha__message--error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export { Captcha };
export default Captcha;
