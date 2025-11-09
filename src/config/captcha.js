/* ================= Captcha Configuration ================= */

/**
 * Конфигурация капчи для разработки и продакшена
 * 
 * Для ТЕСТИРОВАНИЯ на локальном диске:
 * - Установите CAPTCHA_ENABLED = false
 * 
 * Для ПРОДАКШЕНА:
 * - Установите CAPTCHA_ENABLED = true
 */

export const CAPTCHA_CONFIG = {
  // Основной переключатель капчи
  ENABLED: true, // true для продакшена, false для тестирования
  
  // Сообщения об ошибках
  ERROR_MESSAGE: 'Пожалуйста, подтвердите, что вы не робот',
  
  // Дополнительные настройки (если понадобятся в будущем)
  TIMEOUT: 30000, // 30 секунд
  RETRY_ATTEMPTS: 3
};

/**
 * Проверяет, нужна ли капча для данной формы
 * @param {string} token - токен капчи
 * @returns {boolean} - true если капча пройдена или отключена
 */
export const validateCaptcha = (token) => {
  if (!CAPTCHA_CONFIG.ENABLED) {
    return true; // Капча отключена - всегда возвращаем true
  }
  
  return Boolean(token); // Капча включена - проверяем наличие токена
};

/**
 * Возвращает ошибку капчи или null
 * @param {string} token - токен капчи
 * @returns {string|null} - текст ошибки или null если всё ОК
 */
export const getCaptchaError = (token) => {
  if (!CAPTCHA_CONFIG.ENABLED) {
    return null; // Капча отключена - ошибки нет
  }
  
  if (!token) {
    return CAPTCHA_CONFIG.ERROR_MESSAGE;
  }
  
  return null;
};