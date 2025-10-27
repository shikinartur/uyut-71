import React, { useRef, useEffect, useState } from 'react';

/**
 * Yandex SmartCaptcha wrapper component
 * 
 * IMPORTANT: Replace 'YOUR_CAPTCHA_KEY' with your actual Yandex SmartCaptcha key
 * Get your key from: https://cloud.yandex.ru/services/smartcaptcha
 * 
 * Before using in production, update the CAPTCHA_KEY constant below!
 */
const CAPTCHA_KEY = 'ysc1_4DXMaoKbkSOcFSjf5NIevkmNtFsh4gGRChvMNvy261178c8d'; // Replace with your actual key!

let scriptCheckCount = 0;
const MAX_SCRIPT_CHECKS = 50; // 5 seconds total

export const SmartCaptcha = ({ onSuccess, onError, theme = 'dark', size = 'normal' }) => {
  const containerRef = useRef(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);

  useEffect(() => {
    if (CAPTCHA_KEY === 'YOUR_CAPTCHA_KEY') {
      console.warn('⚠️ Yandex SmartCaptcha key is not configured! Please update CAPTCHA_KEY in src/SmartCaptcha.js');
      return;
    }

    // Check if script is loaded
    const checkScriptLoaded = () => {
      if (window.smartCaptcha) {
        setCaptchaLoaded(true);
        initCaptcha();
      } else {
        scriptCheckCount++;
        if (scriptCheckCount < MAX_SCRIPT_CHECKS) {
          setTimeout(checkScriptLoaded, 100);
        } else {
          console.error('Failed to load SmartCaptcha script');
          onError && onError(new Error('SmartCaptcha script failed to load'));
        }
      }
    };

    const initCaptcha = () => {
      if (!containerRef.current) return;

      try {
        // Clear any existing captcha
        if (containerRef.current.innerHTML) {
          containerRef.current.innerHTML = '';
        }

        window.smartCaptcha.render(containerRef.current, {
          sitekey: CAPTCHA_KEY,
          callback: (token) => {
            console.log('✅ Captcha verified, token received');
            onSuccess && onSuccess(token);
          },
          'error-callback': (err) => {
            console.error('❌ Captcha error:', err);
            onError && onError(err);
          },
          hl: 'ru',
        });
      } catch (error) {
        console.error('Failed to initialize captcha:', error);
        setRenderAttempts(prev => prev + 1);
        
        // Retry once after a short delay
        if (renderAttempts === 0) {
          setTimeout(initCaptcha, 500);
        } else {
          onError && onError(error);
        }
      }
    };

    checkScriptLoaded();

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptCheckCount = 0;
    };
  }, [onSuccess, onError, renderAttempts]);

  // Don't render if key is not configured
  if (CAPTCHA_KEY === 'YOUR_CAPTCHA_KEY') {
    return (
      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
        ⚠️ Настройте Yandex SmartCaptcha ключ в src/SmartCaptcha.js (см. SMARTCAPTCHA_SETUP.md)
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="smart-captcha-wrapper"
      style={{ marginBottom: '1rem', minHeight: '65px' }}
    >
      {!captchaLoaded && <div className="text-sm text-gray-500">Загрузка капчи...</div>}
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

