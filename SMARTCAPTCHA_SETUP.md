# Настройка Yandex SmartCaptcha

## Шаги по настройке

### 1. Получите ключ SmartCaptcha

1. Перейдите на https://cloud.yandex.ru/services/smartcaptcha
2. Войдите в свой аккаунт Yandex Cloud или зарегистрируйтесь
3. Создайте новый сервис SmartCaptcha
4. Скопируйте **Client Key** (публичный ключ) и **Secret Key** (секретный ключ)

### 2. Настройте ключ в коде

Откройте файл `src/SmartCaptcha.js` и замените `YOUR_CAPTCHA_KEY` на ваш **Client Key**:

```javascript
const CAPTCHA_KEY = 'ВАШ_CLIENT_KEY'; // Вставьте сюда ваш ключ
```

### 3. Опционально: Настройка верификации на сервере

Если вы хотите дополнительно проверять токены капчи на сервере, создайте API endpoint:

**Пример для Node.js/Express:**

```javascript
app.post('/api/verify-captcha', async (req, res) => {
  const { token } = req.body;
  
  try {
    const response = await fetch('https://smartcaptcha.yandexcloud.net/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: 'ВАШ_SECRET_KEY',
        token: token,
        ip: req.ip
      })
    });
    
    const data = await response.json();
    res.json({ success: data.status === 'ok' });
  } catch (error) {
    console.error('Captcha verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

### 4. Тестирование

После добавления ключа перезагрузите страницу и проверьте:
- Видны ли виджеты капчи на всех формах
- Можно ли отправить форму без прохождения капчи
- Работает ли отправка формы после прохождения капчи

## Формы, защищенные капчей

1. **Калькулятор стоимости** - `handleCalculatorSubmit`
2. **Форма фиксации скидки** - `handlePromoFormSubmit`
3. **Форма записи на консультацию** - `handleAppointmentFormSubmit`
4. **CTA форма консультации** - в секции CTA

## Важные замечания

- Не передавайте Secret Key на клиент!
- Client Key безопасен для использования на фронтенде
- SmartCaptcha автоматически определяет, нужно ли показывать капчу (на основе поведения пользователя)
- Токен капчи действителен только один раз
