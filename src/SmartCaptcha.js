import React, { useRef } from 'react';
import { SmartCaptcha as YandexSmartCaptcha } from '@yandex/smart-captcha';

/**
 * Yandex SmartCaptcha wrapper component
 * 
 * IMPORTANT: Replace 'YOUR_CAPTCHA_KEY' with your actual Yandex SmartCaptcha key
 * Get your key from: https://cloud.yandex.ru/services/smartcaptcha
 */
const CAPTCHA_KEY = 'ysc1_4DXMaoKbkSOcFSjf5NIevkmNtFsh4gGRChvMNvy261178c8d';

export const SmartCaptcha = ({ onSuccess, onError }) => {
  const captchaRef = useRef(null);

  const handleChallenge = (token) => {
    console.log('✅ Captcha verified, token received');
    onSuccess && onSuccess(token);
  };

  const handleError = (err) => {
    console.error('❌ Captcha error:', err);
    onError && onError(err);
  };

  if (CAPTCHA_KEY === 'YOUR_CAPTCHA_KEY') {
    return (
      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
        ⚠️ Настройте Yandex SmartCaptcha ключ в src/SmartCaptcha.js (см. SMARTCAPTCHA_SETUP.md)
      </div>
    );
  }

  return (
    <div className="mb-4" style={{ minHeight: '65px' }}>
      <YandexSmartCaptcha
        ref={captchaRef}
        sitekey={CAPTCHA_KEY}
        onSuccess={handleChallenge}
        onError={handleError}
      />
    </div>
  );
};

/**
 * Hook to verify captcha token on form submission
 */
export const useCaptcha = () => {
  const verifyToken = async (token) => {
    if (!token) {
      throw new Error('Captcha token is missing');
    }

    // Verify token with your backend
    // You'll need to create an API endpoint to verify the token with Yandex
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Captcha verification failed');
      }

      return data.success === true;
    } catch (error) {
      console.error('Captcha verification error:', error);
      throw error;
    }
  };

  return { verifyToken };
};

