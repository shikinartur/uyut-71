/* === Bitrix24 API Configuration === */

/**
 * !!! ВАЖНО !!!
 * Замените эту заглушку на ваш реальный URL Webhook из Bitrix24
 * (например, https://yourcompany.bitrix24.ru/rest/1/webhook_code/)
 */
export const API_ENDPOINT = "https://batura.bitrix24.ru/rest/11/8o01eugvy1rbseqt/crm.lead.add.json";

/**
 * Универсальная функция для отправки данных формы на сервер.
 * @param {object} data - Сформированный объект данных заявки.
 * @param {string} source - Источник заявки (например, 'Calculator' или 'Callback').
 * @returns {Promise<boolean>} - Успех/неудача отправки.
 */
export async function sendDataToApi(data, source) {
  // Формируем данные в формате, который ожидает Bitrix24 API
  const bitrixFields = {
    TITLE: `Уют-71ФИКС - ${data.lead_type || 'Заявка с сайта'} - ${data.name || 'Без имени'}`,
    NAME: data.name || '',
    PHONE: [{ VALUE: data.phone || '', VALUE_TYPE: 'WORK' }],
    EMAIL: data.email ? [{ VALUE: data.email, VALUE_TYPE: 'WORK' }] : undefined,
    COMMENTS: generateComments(data, source),
    SOURCE_ID: '5', // Источник - веб-сайт
    SOURCE_DESCRIPTION: source,
    UTM_SOURCE: 'uyut-71',
    UTM_MEDIUM: 'landing',
    UTM_CAMPAIGN: source,
  };

  // Убираем undefined поля
  Object.keys(bitrixFields).forEach(key => {
    if (bitrixFields[key] === undefined) {
      delete bitrixFields[key];
    }
  });

  // Bitrix24 ожидает параметры как отдельные поля в URL-encoded формате
  const urlParams = new URLSearchParams();
  
  // Добавляем каждое поле как отдельный параметр
  Object.entries(bitrixFields).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Для массивов (PHONE, EMAIL) добавляем каждый элемент отдельно
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          Object.entries(item).forEach(([subKey, subValue]) => {
            urlParams.append(`fields[${key}][${index}][${subKey}]`, subValue);
          });
        } else {
          urlParams.append(`fields[${key}][${index}]`, item);
        }
      });
    } else {
      urlParams.append(`fields[${key}]`, value);
    }
  });

  console.log('Отправляемые данные в Bitrix24:', urlParams.toString());
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Bitrix24 ожидает данные в формате URL-encoded
      body: urlParams.toString(),
    });

    const responseData = await response.json();
    
    if (response.ok && responseData.result) {
      console.log(`Заявка успешно отправлена в Bitrix. ID лида: ${responseData.result}. Источник: ${source}`);
      return true;
    } else {
      console.error(`Ошибка при отправке в Bitrix (HTTP ${response.status}). Источник: ${source}`, responseData);
      return false;
    }
  } catch (error) {
    console.error(`Ошибка сети/соединения при отправке в Bitrix. Источник: ${source}`, error);
    return false;
  }
}

// Функция для генерации комментариев с детальной информацией
export function generateComments(data, source) {
  let comments = `Форма: ${source}\n`;
  comments += `Дата: ${new Date().toLocaleString('ru-RU')}\n\n`;
  
  // Добавляем специфичную информацию в зависимости от типа заявки
  if (data.lead_type === 'Calculator (Fixed Price)') {
    comments += `=== КАЛЬКУЛЯТОР ===\n`;
    comments += `Комплектация: ${data.pack_label || 'Не указана'}\n`;
    comments += `Базовая цена: ${data.base_price ? data.base_price.toLocaleString('ru-RU') + ' ₽' : 'Не указана'}\n`;
    comments += `Дополнения: ${data.choices_sum ? data.choices_sum.toLocaleString('ru-RU') + ' ₽' : '0 ₽'}\n`;
    comments += `Доп. услуги: ${data.addons_sum ? data.addons_sum.toLocaleString('ru-RU') + ' ₽' : '0 ₽'}\n`;
    comments += `Скидка: ${data.promo_amount ? data.promo_amount.toLocaleString('ru-RU') + ' ₽' : '0 ₽'}\n`;
    comments += `ИТОГО: ${data.total_final ? data.total_final.toLocaleString('ru-RU') + ' ₽' : 'Не указано'}\n\n`;
    
    if (data.config_choices) {
      comments += `Выбранные опции:\n`;
      Object.entries(data.config_choices).forEach(([key, value]) => {
        comments += `- ${key}: ${value}\n`;
      });
    }
    
    if (data.config_addons && data.config_addons.length > 0) {
      comments += `Дополнительные услуги:\n`;
      data.config_addons.forEach(addon => {
        comments += `- ${addon}\n`;
      });
      if (data.addons_selected_keys && data.addons_selected_keys.length > 0) {
        comments += `Коды доп. услуг: ${data.addons_selected_keys.join(', ')}\n`;
      }
    }
    
    if (data.custom_wishes) {
      comments += `\n🔸 ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ:\n${data.custom_wishes}\n`;
    }
    
    if (data.notes) {
      comments += `\nПожелания клиента:\n${data.notes}\n`;
    }
  } else if (data.lead_type === 'Promo Fixation (Grand Line block)') {
    comments += `=== ФИКСАЦИЯ СКИДКИ ===\n`;
    comments += `Размер скидки: ${data.promo_percent ? Math.round(data.promo_percent * 100) + '%' : 'Не указан'}\n`;
    comments += `Действует до: ${data.promo_until || 'Не указано'}\n`;
  } else if (data.lead_type === 'Appointment Request (Company Section)') {
    comments += `=== ЗАПИСЬ НА КОНСУЛЬТАЦИЮ ===\n`;
    if (data.appointment_date) {
      comments += `Желаемая дата: ${data.appointment_date}\n`;
    }
    if (data.appointment_time) {
      comments += `Желаемое время: ${data.appointment_time}\n`;
    }
  } else if (data.lead_type === 'Consultation CTA') {
    comments += `=== ЗАПРОС КОНСУЛЬТАЦИИ ===\n`;
    if (data.notes) {
      comments += `\nПожелания клиента:\n${data.notes}\n`;
    }
  }
  
  // Добавляем все дополнительные поля формы в конец комментария
  const additionalFields = [];
  Object.entries(data).forEach(([key, value]) => {
    // Пропускаем стандартные поля, которые уже обработаны выше
    const standardFields = ['name', 'phone', 'email', 'lead_type', 'source', 'timestamp', 
                           'pack_key', 'pack_label', 'total_final', 'config_choices', 'config_addons',
                           'base_price', 'choices_sum', 'addons_sum', 'promo_amount', 'promo_percent', 
                           'promo_until', 'appointment_date', 'appointment_time', 'notes', 'custom_wishes'];
    
    if (!standardFields.includes(key) && value && value.toString().trim() !== '') {
      additionalFields.push(`${key}: ${value}`);
    }
  });
  
  if (additionalFields.length > 0) {
    comments += `\n=== ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ ===\n`;
    additionalFields.forEach(field => {
      comments += `${field}\n`;
    });
  }
  
  return comments;
}
