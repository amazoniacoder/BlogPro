import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Spinner } from '@/ui-system/components/feedback';
import { Button } from '@/ui-system/components/button';
import { Heading, Text } from '@/ui-system/components/typography';
import { Card } from '@/ui-system/components/card';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify/${token}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to home page...');
          
          const data = await response.json();
          if (data.user?.email) {
            localStorage.setItem('emailVerified', data.user.email);
          }
          
          setTimeout(() => {
            window.close();
            if (!window.closed) {
              setLocation('/');
            }
          }, 2000);
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error occurred');
      }
    };

    verifyEmail();
  }, [token, setLocation]);

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
        <Heading level={1}>Email Verification</Heading>
        
        {status === 'loading' && (
          <div style={{ padding: '2rem' }}>
            <Spinner size="lg" />
            <Text>Verifying your email address...</Text>
          </div>
        )}
        
        {status === 'success' && (
          <div style={{ padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <Heading level={2}>Email Verified!</Heading>
            <Text>Welcome to BlogPro!</Text>
            <Text>You're being redirected to the home page...</Text>
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <Text color="error">{message}</Text>
            <Button onClick={() => setLocation('/auth')}>
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
