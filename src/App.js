import React, { useMemo, useState, useRef, useEffect } from "react";
import "./index.css";
// Helmet импортируется в SeoHead.js, здесь остается для обратной совместимости, но лучше использовать SeoHead.js
// import { Helmet } from "react-helmet"; 

/* ================= Utils ================= */
// Функция форматирования числа в рубли
function rub(n) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/* ================= Data & Config ================= */

const CONTACTS = {
  phone: "8 (495) 212-13-77",
  phoneHref: "+74952121377",
  email: "dom@batura.ru",
  address: "Москва, пр. 60-летия Октября, 9с2, офис 217",
  address2: "метро Академическая (12 мин пешком)",
  hours: "ПН–СБ 10:00 – 20:00 (по записи)",
  };

/* === PROMO: единая настройка акции для всего сайта) === */
const PROMO = {
  enabled: true,                            // вкл/выкл акцию true/false
  percent: 0.07,                            // размер скидки (например, 0.07 для 7%)
  until: "10 октября",                      // срок действия акции
  exitPopupEnabled: true,                   // срок вкл/выкл Popup true/false
  ui: {
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    panelBg: "bg-red-50",
    panelBorder: "border-red-300",
    panelTitle: "text-red-700",
    panelText: "text-red-600",
    summaryText: "text-red-700",
  },
};
PROMO.label = `Скидка ${Math.round(PROMO.percent*100)}%`;
PROMO.shortTag = `Скидка до ${PROMO.until}`;
PROMO.bannerText = `Успейте зафиксировать цену — скидка до ${PROMO.until}!`; 

/* === API Configuration === */

/**
 * !!! ВАЖНО !!!
 * Замените эту заглушку на ваш реальный URL Webhook из Bitrix24
 * (например, https://yourcompany.bitrix24.ru/rest/1/webhook_code/)
 */
const API_ENDPOINT = "https://your-bitrix24-webhook.com/endpoint/"; 

/**
 * Универсальная функция для отправки данных формы на сервер.
 * @param {object} data - Сформированный объект данных заявки.
 * @param {string} source - Источник заявки (например, 'Calculator' или 'Callback').
 * @returns {Promise<boolean>} - Успех/неудача отправки.
 */
async function sendDataToApi(data, source) {
  const payload = {
    source: source,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  // В реальном приложении здесь будет логика exponential backoff для повторных попыток
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Отправляем данные в формате JSON
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Заявка успешно отправлена в Bitrix. Источник: ${source}`);
      return true;
    } else {
      console.error(`Ошибка при отправке в Bitrix (HTTP ${response.status}). Источник: ${source}`, await response.text());
      return false;
    }
  } catch (error) {
    console.error(`Ошибка сети/соединения при отправке в Bitrix. Источник: ${source}`, error);
    return false;
  }
}

// Data definitions (PACKS, ADDONS, PHOTOS, etc. are omitted for brevity but remain unchanged)

const LOGO_URL = "/images/logo-batura.webp";

const PHOTOS = {
  main: "/images/General/Генеральный партнер 1.webp",
  standard: [
    "/images/Комплектация Стандарт 1.webp",
    "/images/Комплектация Стандарт 2.webp",
  ],
  optima: [
    "/images/Комплектация Оптима 1.webp",
    "/images/Комплектация Оптима 2.webp",
  ],
  luxe: [
    "/images/Комплектация Люкс 1.webp",
    "/images/Комплектация Люкс 2.webp",
  ],
};
// Изображения для главного баннера (Hero)
const HERO_IMAGES = [
  "/images/General/Генеральный партнер 1.webp",
  "/images/General/Главный банер 2.webp",
  "/images/General/Главный банер 3.webp",
  "/images/General/Главный банер 4.webp",
];
const FLOORPLANS = {
  empty: "/images/План без мебели.webp",
  furnished:
    "/images/План с мебелью.webp",
};

const GALLERY = [
  {
    location: "Можайск. кпИзумрудное Озеро", date: "декабрь 2024", pack: "КВАДРО-БРУС",

    images: ["/images/Example/Izumrudozero_3.webp", "/images/Example/Izumrudozero_1.webp", "/images/Example/Izumrudozero_2.webp"],
  },
  {
    location: "Калуга. Желыбино", date: "май 2025", pack: "ОПТИМА",
    images: ["/images/Example/Kaluga_1.webp", "/images/Example/Kaluga_2.webp", "/images/Example/Kaluga_3.webp", "/images/Example/Kaluga_4.webp"],
  },
  {
    location: "Солнечногорск", date: "октябрь 2024", pack: "СТАНДАРТ",
    images: ["/images/Example/solnechnogorsk_3.webp", "/images/Example/solnechnogorsk_2.webp", "/images/Example/solnechnogorsk_1.webp"],
  },
];

const PACKS = {
  standard: {
    key: "standard",
    label: "СТАНДАРТ",
    subLabel: "Базовый фасад: имитация бруса (покраска в подарок). Крыша металлочерепица Grand_Line",
    warranty: 15,
    basePrice: 2_550_000,
    fixedDetails: {
      facadeEnd: `Фасад (бока): <b>имитация бруса</b>, сорт АВ (покраска в подарок)`,
      facadeSide: `Фасад (торцы): <b>имитация бруса</b>, сорт АВ (покраска в подарок)`,
      roof: `Крыша: <b>металлочерепица</b> Grand_Line Classic, RAL 7024 (Графитовый серый)`,
      soffit: `Подшивка свесов: <b>имитация бруса</b>, сорт АВ (покраска в подарок)`,
      frame: `Каркас дома: калиброванный <b>камерной сушки</b>`,
      membrane: "Изоляция: мембраны/плёнки Grand_Line",
      sound: "Шумоизоляции: в полном объёме",
      insulation: "Утеплитель плитный",
    },
    choices: {
      insulation: {
        label: "Утепление стены, пол, крыша",
        options: {
          "Knauf 150 мм": 0,
          "Технониколь 150 мм": 60_000,
          "Knauf 200 мм": 70_000,
          "Технониколь 200 мм": 160_000,
        },
      },
      floor: {
        label: "Отделка пола",
        options: { "ОСП 22 мм": 0, "Доска шпунтованная": 90_000 },
      },
      inner_finish_wood: {
        label: "Внутренняя отделка",
        options: {
          "Без отделки": 0,
          Вагонка: 360_000,
          "Имитация бруса": 750_000,
        },
      },
      foundation: {
        label: "Фундамент",
        options: { "Винтовые сваи 2,5 м × 108 мм": 0, "ЖБ сваи 3 м": 45_000 },
      },
      windows: {
        label: "Окна (профиль)",
        options: { "РЕХАУ CONSTANTA 60мм": 0, "РЕХАУ GRAZIO 70мм": 30_000 },
      },
      glazing: {
        label: "Стеклопакет",
        options: { "Двухкамерный 32мм": 0, "40 мм энергосберегающий": 55_000 },
      },
      ventilation: {
        label: "Вентиляция утеплённая 125 мм (шт.)",
        options: { "0": 0, "1": 35_000, "2": 70_000 },
      },
      color: {
        label: "Цвет фасада/крыши",
        options: {
          "RAL 7024 серый графит": 0,
          "RAL 8017 коричневый шоколад": 0,
          "RAL 3005 красное вино": 0,
        },
      },
    },
  },
  optima: {
    key: "optima",
    label: "ОПТИМА",
    subLabel: "Хит продаж. Оптимальный баланс. Фасад и крыша Grand_Line",
    warranty: 15,
    basePrice: 2_940_000,
    fixedDetails: {
      facadeEnd:
        `Фасад (бока): <b>профнастил</b> Grand_Line C21R Drap TR, RAL 7024 (Графитовый серый)`,
      facadeSide: `Фасад (торцы): <b>сайдинг</b> Grand_Line Natural-брус Tundra клен`,
      roof: `Крыша: <b>профнастил</b> Grand_Line C21R Drap TR, RAL 7024 (Графитовый серый)`,
      soffit:
        `Подшивка свесов: <b>сайдинг</b> Grand_Line Natural-брус Tundra клен`,
      frame: `Каркас дома: калиброванный <b>камерной сушки</b>`,
      membrane: "Изоляция: мембраны/плёнки Grand_Line",
      sound: "Шумоизоляции: в полном объёме",
    },
    choices: {
      insulation: {
        label: "Утепление стены, пол, крыша",
        options: {
          "Knauf 150 мм": 0,
          "Технониколь 150 мм": 60_000,
          "Knauf 200 мм": 70_000,
          "Технониколь 200 мм": 160_000,
        },
      },
      floor: {
        label: "Отделка пола",
        options: { "ОСП 22 мм": 0, "Доска шпунтованная": 90_000 },
      },
      inner_finish_wood: {
        label: "Внутренняя отделка",
        options: {
          "Без отделки": 0,
          Вагонка: 360_000,
          "Имитация бруса": 750_000,
        },
      },
      foundation: {
        label: "Фундамент",
        options: { "ЖБ сваи 3 м": 0, "Винтовые сваи 2,5 м × 108 мм": -45_000 },
      },
      windows: {
        label: "Окна (профиль)",
        options: { "РЕХАУ GRAZIO 70мм": 0, "РЕХАУ CONSTANTA 60мм": -30_000 },
      },
      glazing: {
        label: "Стеклопакет",
        options: { "Двухкамерный 32мм": 0, "40 мм энергосберегающий": 55_000 },
      },
      ventilation: {
        label: "Вентиляция утеплённая 125 мм (шт.)",
        options: { "0": 0, "1": 35_000, "2": 70_000 },
      },
      color: {
        label: "Цвет фасада/крыши",
        options: {
          "RAL 7024 серый графит": 0,
          "RAL 8017 коричневый шоколад": 0,
          "RAL 3005 красное вино": 0,
        },
      },
    },
  },
  luxe: {
    key: "luxe",
    label: "КВАДРО-БРУС",
    subLabel: "Люкс отделка: маталлический сайдинг и фальцевая крыша Grand_Line",
    warranty: 15,
    basePrice: 3_450_000,
    fixedDetails: {
      facadeEnd:
        `Фасад (бока): <b>Металлосайдинг</b> Квадро-брус Grand_Line RAL 7024 (Графитовый серый)`,
      facadeSide: `Фасад (торцы): <b>Металлосайдинг</b> Вертикаль Grand_Line (бежевый)`,
      roof:
        `Крыша: <b>Кликфальц</b> Grand_Line Drap с пленкой на замках, RAL 7024 (Графитовый серый)`,
      soffit: `Подшивка свесов: <b>Металлосайдинг</b> Вертикаль (бежевый)`,
      frame: `Каркас дома: калиброванный <b>камерной сушки</b>`,
      membrane: "Изоляция: мембраны/плёнки Grand_Line",
      sound: "Шумоизоляции: в полном объёме",
    },
    choices: {
      insulation: {
        label: "Утепление стены, пол, крыша",
        options: {
          "Knauf 150 мм": 0,
          "Технониколь 150 мм": 60_000,
          "Knauf 200 мм": 70_000,
          "Технониколь 200 мм": 160_000,
        },
      },
      floor: {
        label: "Отделка пола",
        options: { "ОСП 22 мм": 0, "Доска шпунтованная": 90_000 },
      },
      inner_finish_wood: {
        label: "Внутренняя отделка",
        options: {
          "Без отделки": 0,
          Вагонка: 360_000,
          "Имитация бруса": 750_000,
        },
      },
      foundation: {
        label: "Фундамент",
        options: { "ЖБ сваи 3 м": 0, "Винтовые сваи 2,5 м × 108 мм": -45_000 },
      },
      windows: {
        label: "Окна (профиль)",
        options: { "РЕХАУ GRAZIO 70мм": 0, "РЕХАУ CONSTANTA 60мм": -30_000 },
      },
      glazing: {
        label: "Стеклопакет",
        options: { "Двухкамерный 32мм": 0, "40 мм энергосберегающий": 55_000 },
      },
      ventilation: {
        label: "Вентиляция утеплённая 125 мм (шт.)",
        options: { "0": 0, "1": 35_000, "2": 70_000 },
      },
      color: {
        label: "Цвет фасада/крыши",
        options: {
          "RAL 7024 серый графит": 0,
          "RAL 8017 коричневый шоколад": 0,
          "RAL 3005 красное вино": 0,
        },
      },
    },
  },
};

const ADDONS = [
  { key: "lamination", label: "Ламинация окон снаружи, тёмно-серый", price: 75_000 },
  { key: "snow", label: "Снегозадержание Grand_Line RAL 7024", price: 32_000 },
  { key: "drain", label: "Водосточная система Grand_Line RAL 7024", price: 120_000 },
  { key: "deck", label: "Террасная доска ДПК Grand_Line 140 мм (графит)", price: 190_000 },
  { key: "inner_comms", label: "Коммуникации", noPrice: true },
  { key: "finish_turnkey", label: "Чистовая отделка под ключ", noPrice: true },
];

/* ================= Components ================= */

// Функция для прокрутки к блоку CTA
const scrollToCTA = (setIsMenuOpen) => {
    // Если меню открыто, закрываем его
    if (setIsMenuOpen) setIsMenuOpen(false);
    // Прокрутка к секции #cta
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

function Header({ isMenuOpen, setIsMenuOpen, daysLeft, promoOffset = 0, totalWithPromo }) {

  // Высота шапки (в пикселях) для позиционирования мобильного меню
  const HEADER_HEIGHT = 68;

  return (
    <>
      {/* Шапка фиксированная, сдвигаем вниз на высоту промо-полосы */}
      <header className="fixed z-50 bg-white shadow-md w-full" style={{ top: promoOffset }}>
  <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
   <a
  href="#top"
  className="flex items-center gap-3"
  onClick={(e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  <img
    src={LOGO_URL}
    alt="Логотип компании Батура"
    className="h-14 w-auto"   
  />
  <span className="block font-bold text-base sm:text-lg">
    Каркасный дом «Уют-71»
  </span>
</a>
        <nav className="hidden md:flex gap-6 text-sm font-medium" aria-label="Основная навигация">
          <a href="#packs" className="hover:text-neutral-600 transition">
            Калькулятор
          </a>
                  <a href="#reviews" className="hover:text-neutral-600 transition">
            Отзывы
          </a>
          <a href="#company" className="hover:text-neutral-600 transition">
            Контакты
          </a>

        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a
            className="font-semibold flex-shrink-0"
            href={`tel:${CONTACTS.phoneHref}`}
            aria-label="Позвонить"
            itemProp="telephone"
          >
            {CONTACTS.phone}
          </a>
          {totalWithPromo && (
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-neutral-200 text-emerald-700 font-extrabold text-sm">
              <span className="hidden lg:inline font-semibold text-emerald-700">К ОПЛАТЕ</span>
              <span className="text-base">{totalWithPromo}</span>
              <a
                href="#calc"
                className="ml-1 px-2 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold shadow hover:from-red-600 hover:to-red-800"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#calc form');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                РАСЧЕТ
              </a>
            </span>
          )}
        </div>
        <button
          className="md:hidden p-2 rounded bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Открыть мобильное меню"
        >
          ☰
        </button>
      </div>
      </header> 

      {/* Мобильное меню */}
      <nav
        className={`md:hidden bg-white border-t px-4 py-3 space-y-3 text-sm transition-all duration-200 ease-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} fixed w-full z-40 shadow-lg`}
        style={{ top: promoOffset + HEADER_HEIGHT }}
        aria-label="Мобильная навигация"
      >
          <a href="#packs" className="block hover:text-neutral-600" onClick={() => setIsMenuOpen(false)}>
            Калькулятор
          </a>
          <a href="#reviews" className="block hover:text-neutral-600" onClick={() => setIsMenuOpen(false)}>
            Отзывы
          </a>
          <a href="#company" className="block hover:text-neutral-600" onClick={() => setIsMenuOpen(false)}>
           Контакты
          </a>
          <div className="mt-2">
            <a
              href={`tel:${CONTACTS.phoneHref}`}
              className="block font-semibold"
            >
              {CONTACTS.phone}
            </a>
            <button
              type="button"
              className="mt-2 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-emerald-700 transition"
              onClick={() => scrollToCTA(setIsMenuOpen)}
              aria-label="Получить бесплатную консультацию"
            >
              Получить бесплатную консультацию
            </button>
          </div>
        </nav>
        
        {/* Отступ перенесён в основной контейнер страницы */}
    </>
  );
}

// ImageSlider Component (from App2.js)
function ImageSlider({ images = [], small = false, onOpen, auto = false, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  // Автопрокрутка (для Hero)
  useEffect(() => {
    if (!auto || images.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      next();
    }, Math.max(2000, interval));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auto, interval, images.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) prev();
    if (diff < -50) next();
    touchStartX.current = null;
  };

  if (!images || images.length === 0) return null;
  
  return (
    <div
      className={`relative ${small ? "aspect-[4/3] w-full h-56" : "h-[380px] w-full lg:h-[450px]"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }}
      onMouseLeave={() => { /* перезапуск таймера произойдёт через effect */ }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Фото ${i + 1}`}
            // Замена на loading="eager" для первого изображения Hero для FCP (First Contentful Paint)
            loading={auto && i === 0 ? "eager" : "lazy"} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
            onLoad={(e) => {
              if (i === 0) e.target.closest('.relative').style.backgroundImage = 'none';
            }}
          />
        ))}
      </div>
      {onOpen && (
        <button
          type="button"
          className="hidden md:block absolute inset-0 z-[5] cursor-zoom-in"
          aria-label="Открыть фото в полноэкранном режиме"
          onClick={() => onOpen({ images, index })}
        />
      )}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white backdrop-blur-sm hover:bg-black/50 transition z-10"
            aria-label="Предыдущее фото"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white backdrop-blur-sm hover:bg-black/50 transition z-10"
            aria-label="Следующее фото"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === index ? "bg-white" : "bg-white/50"}`}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Modal Component (for Hero image/Gallery)
function Modal({ images = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(null);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!images || images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) prev();
    if (diff < -50) next();
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={images[index]}
        alt={`Просмотр фото ${index + 1} из ${images.length}`}
        className="max-h-[95%] max-w-[95%] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
        loading="eager"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold opacity-70 hover:opacity-100 transition"
        aria-label="Закрыть полноэкранный просмотр"
      >
        &times;
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/25 rounded-full text-white"
            aria-label="Предыдущее фото"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/25 rounded-full text-white"
            aria-label="Следующее фото"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


// Packs Section (from App.js with App2.js enhancements)
function Packs({ activePack, setActivePack }) {
    return (
        <section id="packs" className="mx-auto max-w-7xl px-4 py-8">
            <h3 className="text-2xl font-bold mb-4">Комплектации</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {Object.values(PACKS).map((p) => (
                    <div
                        key={p.key}
                        onClick={() => setActivePack(p.key)}
                        // Добавление hover-эффекта для карточек
                        className={`cursor-pointer text-left rounded-2xl border transition hover:shadow-xl hover:scale-[1.01] duration-200 ${
                            activePack === p.key ? "border-emerald-600 ring-4 ring-emerald-200" : "border-neutral-200"
                        }`}
                    >
                        <div className="relative">
                            <ImageSlider images={PHOTOS[p.key]} small />
                            {p.key === "optima" && (
                                <span className="absolute top-2 left-2 text-[10px] uppercase bg-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                                    🏆 Хит продаж
                                </span>
                            )}
                            <span
                              className={`absolute top-2 right-2 text-[10px] ${PROMO.ui.badgeBg} ${PROMO.ui.badgeText} px-3 py-1 rounded-full font-bold shadow-md`}
                              >
                               {PROMO.shortTag}
                            </span>

                        </div>
                        <div className="p-4">
                            <div className="flex flex-col gap-1 mb-2">
                                <h4 className="text-xl font-bold text-neutral-900">{p.label}</h4>
                                <p className="text-sm text-neutral-600">{p.subLabel}</p>
                            </div>
                            <div className="text-base text-neutral-700 font-semibold flex justify-between items-center">
                                <span>База: <span className="text-xl font-extrabold text-neutral-900">{rub(p.basePrice)}</span></span>
                                <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                    Гарантия {p.warranty} лет
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


// Calculator Section (from App.js with App2.js enhancements)
// ДОБАВЛЕНА: stickyTop в аргументы для расчета смещения sticky элемента
  function Calculator({ activePack, setActivePack, totalWithPromoRef, stickyTop = 92 }) {
    // Fallback to avoid ReferenceError if old HMR chunk still references promoOffset
    const pack = PACKS[activePack];
    const [choices, setChoices] = useState(() => {
        const defaults = {};
        Object.entries(pack.choices).forEach(([k, cfg]) => {
            defaults[k] = Object.keys(cfg.options)[0];
        });
        return defaults;
    });
    const [addons, setAddons] = useState({});
    const [promoEnabled, setPromoEnabled] = useState(PROMO.enabled);
    const [isSent, setIsSent] = useState(false); // Состояние отправки

    // Recalculate choices defaults when activePack changes
    useEffect(() => {
        const defaults = {};
        Object.entries(pack.choices).forEach(([k, cfg]) => {
            defaults[k] = Object.keys(cfg.options)[0];
        });
        setChoices(defaults);
        setAddons({});
        setIsSent(false); // Сброс статуса отправки
    }, [activePack, pack.choices]);

    const choicesSum = useMemo(() => {
      let sum = 0;
      Object.entries(choices).forEach(([k, v]) => {
        const conf = pack.choices[k];
        if (!conf) return;
        const delta = Number(conf.options[v] ?? 0);
        sum += Number.isFinite(delta) ? delta : 0;
      });
      return sum;
    }, [choices, pack]);

    const addonsSum = useMemo(() => {
      let sum = 0;
      ADDONS.forEach((a) => {
        if (addons[a.key] && !a.noPrice) {
          const price = Number(a.price || 0);
          sum += Number.isFinite(price) ? price : 0;
        }
      });
      return sum;
    }, [addons]);

    const basePrice = pack.basePrice;
    const total = Math.max(0, basePrice + choicesSum + addonsSum);
    const promoAmount = useMemo(() => {
      return promoEnabled ? Math.round(total * PROMO.percent) : 0;
    }, [total, promoEnabled]);
    const totalWithPromo = total - promoAmount;

    // Обновляем реф для мобильного футера
    useEffect(() => {
      totalWithPromoRef.current = rub(totalWithPromo);
    }, [totalWithPromo, totalWithPromoRef]);

    const handleCalculatorSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = Object.fromEntries(fd.entries());
        
        if (!payload.name || !payload.phone) return;

        const data = {
            ...payload,
            lead_type: "Calculator (Fixed Price)",
            pack_key: activePack,
            pack_label: pack.label,
            total_final: totalWithPromo,
            config_choices: choices,
            config_addons: ADDONS.filter(a => addons[a.key]).map(a => a.label),
            // Добавляем все расчетные данные для удобства Bitrix
            base_price: basePrice,
            choices_sum: choicesSum,
            addons_sum: addonsSum,
            promo_amount: promoAmount,
        };

        const success = await sendDataToApi(data, 'Calculator');

        if (success) {
            setIsSent(true);
        } else {
            // Резервное сообщение об ошибке
            // Замена alert() на console.error() - для продакшн-кода
            console.error("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или позвоните нам.");
        }
    };

  return (
    <section id="calc" className="mx-auto max-w-7xl px-4 pb-8 relative">
      <h3 className="text-2xl font-bold mb-6">Калькулятор стоимости</h3>
  <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">
                Базовая цена
              </label>
              <div className="flex items-end gap-2">
                <span className="text-3xl md:text-4xl font-extrabold text-neutral-900">{rub(basePrice)}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Комплектация</label>
              <select
                value={activePack}
                onChange={e => setActivePack(e.target.value)}
                className="w-full md:w-60 px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-100 text-lg font-semibold"
              >
                {Object.values(PACKS).map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold mb-3">Основа комплектации</h4>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-neutral-700">
              {Object.values(pack.fixedDetails).map((detail, i) => (
                // Используем span с dangerouslySetInnerHTML, как в оригинале
                <li key={i} className="flex gap-2">
                  <span>•</span>
                  <span dangerouslySetInnerHTML={{ __html: detail }} />
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold mb-3">Конфигурация</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(pack.choices).map(([key, cfg]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1">
                    {cfg.label}
                  </label>
                  <select
                    value={choices[key]}
                    onChange={(e) =>
                      setChoices((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {Object.entries(cfg.options).map(([label, delta]) => {
                      const isColor = cfg.label.toLowerCase().includes("цвет");
                      const zeroHint = isColor && delta === 0 ? " (без доплаты)" : "";
                      const priceHint =
                        delta !== 0
                          ? delta > 0
                            ? `(+${rub(delta)})`
                            : `(${rub(delta)})`
                          : zeroHint;
                      return (
                        <option key={label} value={label}>
                          {label} {priceHint}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
            {/* УДАЛЕНО: Блок акции с Grand Line перенесен в Краткий расчет */}
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Можно добавить в заказ</h4>
            </div>
            <div className="space-y-2">
              {ADDONS.map((a) => (
                <label
                  key={a.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{a.label}</div>
                    <div className="text-xs text-neutral-500">
                      {a.noPrice ? "по расчету" : rub(a.price)}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(addons[a.key])}
                    onChange={(e) =>
                      setAddons((prev) => ({ ...prev, [a.key]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-neutral-900 focus:ring-neutral-900"
                  />
                </label>
              ))}
              <div className="pt-3 border-t border-dashed text-xs text-neutral-500">
                * Позиции без цены рассчитаем персонально после уточнения.
              </div>
            </div>
          </div>
        </div>
  {/* ИЗМЕНЕНИЕ: ДОБАВЛЕНЫ lg:sticky и self-start, а также style={{ top: stickyTop }} для фиксации на десктопе */}
  <aside className="space-y-4 lg:sticky self-start" style={{ top: stickyTop }}>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold mb-3">Краткий расчет</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Базовая цена ({pack.label})</span>
                <b>{rub(basePrice)}</b>
              </div>
              <div className="flex justify-between">
                <span>Конфигурация</span>
                <b>{choicesSum >= 0 ? `+${rub(choicesSum)}` : rub(choicesSum)}</b>
              </div>
              <div className="flex justify-between">
                <span>Добавлено в расчет</span>
                <b>{addonsSum >= 0 ? `+${rub(addonsSum)}` : rub(addonsSum)}</b>
              </div>
              <div className="border-t pt-2 flex justify-between text-base">
                <span className="font-semibold">ИТОГО БЕЗ СКИДКИ</span>
                <span className="font-extrabold text-2xl">{rub(total)}</span>
              </div>

              {/* ИЗМЕНЕНО: Блок акции Grand Line с галочкой "Применить" */}
              {/* Flex-col для логотипа над текстом, и flex justify-between для выравнивания */}
              <div className={`flex flex-col gap-2 p-3 mt-2 mb-2 rounded-xl border border-dashed ${PROMO.ui.panelBorder} ${PROMO.ui.panelBg}`}>
                {/* Логотип и заголовок в ряд */}
                <div className="flex items-center gap-2">
                    <img src="/images/grandline-logo.webp" alt="Grand_Line — партнер акции" className="h-14 w-auto" style={{maxWidth:'120px'}} loading="lazy"/>
                    <p className={`font-bold text-sm ${PROMO.ui.panelTitle}`}>
                        Акция: {`${PROMO.label} до ${PROMO.until}`}
                    </p>
                </div>

                {/* Строка скидки с чекбоксом и выравниванием суммы */}
                <div className="flex items-center justify-between gap-4 text-sm">
                    {/* Чекбокс и текст */}
                    <label className="inline-flex items-center gap-2 font-medium">
                        <input
                        type="checkbox"
                        className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                        checked={promoEnabled}
                        onChange={(e) => setPromoEnabled(e.target.checked)}
                        />
                        <span>Применить скидку</span>
                    </label>

                    {/* Выровненная сумма скидки */}
                    <span className={`font-extrabold text-base ${PROMO.ui.panelTitle}`}>
                        -{rub(promoAmount)}
                    </span>
                </div>
            </div>
            {/* КОНЕЦ ИЗМЕНЕННОГО БЛОКА */}

              <div className="border-t border-emerald-500 pt-2 flex justify-between text-base bg-emerald-50 -mx-3 -mb-3 px-3 py-2 rounded-b-xl">
                <span className="font-extrabold text-base text-emerald-700">К ОПЛАТЕ (СО СКИДКОЙ)</span>
                <span className="font-extrabold text-2xl sm:text-3xl text-emerald-700">
                  {rub(totalWithPromo)}
                </span>
              </div>
            </div>
            {isSent ? (
              <div className="mt-4 p-4 bg-emerald-100 border border-emerald-400 rounded-xl text-center">
                  <p className="font-bold text-emerald-700">✅ По готовности отправим Вам расчет!</p>
                  <p className="text-sm text-emerald-600 mt-1">Ждите звонка нашего менеджера.</p>
                  <button
                    type="button"
                    onClick={() => setIsSent(false)}
                    className="mt-3 text-xs text-neutral-500 underline"
                  >
                    Сделать новый расчет
                  </button>
              </div>
            ) : (
              <form
              className="mt-4 grid gap-3"
              onSubmit={handleCalculatorSubmit}
            >
              <div className="grid grid-cols-1 gap-3">
                {/* УДАЛЕНО: Заголовок "Оставьте контакты для фиксации цены и скидки" */}
                <div>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ваше имя"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-900"
                  />
                </div>
                <div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-900"
                    inputMode="tel"
                    // Паттерн для телефонного номера в формате 8 (XXX) XXX-XX-XX
                    pattern="^((\+7|7|8)[\s\-\(\)]*)?(\d{3})[\s\-\)]*(\d{3})[\s\-]*(\d{2})[\s\-]*(\d{2})$"
                    maxLength={18}
                  />
                </div>
                <div>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Ваши пожелания или вопросы"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-900"
                  />
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-xl hover:bg-emerald-700 transition" 
                >
                  ПОЛУЧИТЬ РАСЧЕТ И ЗАФИКСИРОВАТЬ ЦЕНУ
                </button>
                {/* ПРАВКА 1: Кнопка ведет на прокрутку к форме CTA */}
                <button
                  type="button"
                  onClick={() => scrollToCTA()}
                  className="w-full px-4 py-3 rounded-xl border-2 border-emerald-600 font-bold text-emerald-700 bg-white hover:bg-emerald-50 transition"
                >
                  Получить бесплатную консультацию
                </button>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                * Доставка и бытовка рассчитываются индивидуально.
              </div>
            </form>
            )}
            
          </div>
        </aside>
      </div>
      {/* Фиксированная панель стоимости для мобильных */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden flex items-center justify-between bg-emerald-600 px-4 py-2 shadow-lg transition-all" 
        style={{
          boxShadow: "0 -2px 16px 0 rgba(0,0,0,0.2)",
          pointerEvents: 'auto',
        }}
      >
        <div onClick={() => {
          const el = document.querySelector('#calc form');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }} className="cursor-pointer">
          <span className="block text-xs text-emerald-100 font-medium">Ваша цена со скидкой</span>
          <span className="block text-2xl font-extrabold text-white">{totalWithPromoRef.current}</span>
        </div>
        <button
          onClick={() => {
            const el = document.querySelector('#calc form');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="ml-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 text-white font-extrabold text-lg shadow-xl hover:bg-red-700 transition"
          style={{ pointerEvents: 'auto' }}
        >
          РАСЧЕТ ЦЕНЫ
        </button>
      </div>
    </section>
  );
}

// Gallery Section (from App2.js)
function Gallery({ openModal }) {
  // Данные для подписей к галерее теперь берутся из глобальной константы GALLERY
  
  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 pt-0 pb-8">
      <h3 className="text-2xl font-bold mb-3">Примеры работ</h3>
      {/* ИЗМЕНЕНИЕ ГАЛЕРЕИ: grid md:grid-cols-3, так как осталось 3 проекта */}
      <div className="grid md:grid-cols-3 gap-3"> 
        {GALLERY.map((project, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-lg"
            // Удалена логика onClick для модалки, чтобы не конфликтовать со слайдером
          >
            {/* ИЗМЕНЕНИЕ ГАЛЕРЕИ: Используем ImageSlider для каждого проекта. */}
            {/* По требованию: в десктопе по клику открывается зум, на мобильном только свайп. */}
            <ImageSlider
              images={project.images}
              small={true}
              onOpen={openModal}
            />

            {/* Подпись к фото */}
            <div className="w-full bg-white text-xs px-3 py-2 flex flex-col gap-0.5 border-t">
              <span className="font-bold text-sm text-neutral-900">{project.location || "Подмосковье"}</span>
              <span className="text-neutral-600">{project.date || "2023"} — Комплектация: {project.pack || "Стандарт"}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Кнопка "ПОЛУЧИТЬ БОЛЬШЕ ФОТО И ОТЗЫВЫ КЛИЕНТОВ" была удалена в предыдущем шаге. */}
    </section>
  );
}

// FloorPlan Section (from App.js with App2.js enhancements)
function FloorPlans({ openModal }) {
    return (
        <section id="plans" className="mx-auto max-w-7xl px-4 py-6">
            <h3 className="text-2xl font-bold mb-3">Планировка: Дом «Уют-71»</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div
                    className="bg-white rounded-2xl border border-neutral-200 p-5 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
                      if (isDesktop) openModal({ images: [FLOORPLANS.empty], index: 0 });
                    }}
                >
                    <h4 className="text-lg font-bold mb-4">Посмотреть площади и размеры</h4>
                    <img
                        src={FLOORPLANS.empty}
                        alt="Планировка дома «Уют-71» без мебели"
                        className="w-full max-h-[420px] object-contain rounded-xl"
                        loading="lazy"
                    />
                </div>
                <div
                    className="bg-white rounded-2xl border border-neutral-200 p-5 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
                      if (isDesktop) openModal({ images: [FLOORPLANS.furnished], index: 0 });
                    }}
                >
                    <h4 className="text-lg font-bold mb-4">Вариант расстановки мебели</h4>
                    <img
                        src={FLOORPLANS.furnished}
                        alt="Планировка дома «Уют-71» с мебелью"
                        className="w-full max-h-[420px] object-contain rounded-xl"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}

/**
 * Компонент для вставки виджета Яндекс.Отзывов с QR-кодом для быстрого перехода.
 */
function YandexReviewsWidget() {
  const reviewsUrl = "https://yandex.ru/maps-reviews-widget/104037212737?comments";
  
  // ИСПРАВЛЕНО: Путь к изображению
  const qrCodeImagePath = "/images/qrcod_отзыв.webp"; 

  // Код виджета, предоставленный пользователем, с небольшими изменениями для адаптивности.
  const widgetHtml = `<div style="width: 100%; height: 800px; overflow: hidden; position: relative; max-width: 560px; margin: 0 auto;">
                        <iframe 
                          style="width: 100%; height: 100%; border: 1px solid #e6e6e6; border-radius: 8px; box-sizing: border-box;" 
                          src="${reviewsUrl}"
                          title="Виджет отзывов Яндекс.Карты"
                        ></iframe>
                        <a 
                          href="https://yandex.com.tr/maps/org/batura/104037212737/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style="box-sizing:border-box; text-decoration:none; color:#b3b3b3; font-size:10px; font-family: YS Text, sans-serif; padding:0 20px; position:absolute; bottom:8px; width:100%; text-align:center; left:0; overflow:hidden; text-overflow:ellipsis; display:block; max-height:14px; white-space:nowrap; padding:0 16px; box-sizing:border-box"
                        >
                          Батура на карте Москвы — Яндекс Карты
                        </a>
                      </div>`;

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Отзывы наших клиентов</h2>
        
        {/* Контейнер для виджета и QR-кода */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            
            {/* Виджет */}
            <div 
                className="lg:w-1/2 w-full max-w-lg mx-auto lg:mx-0"
                // Для iframe с виджетом используем dangerouslySetInnerHTML
                dangerouslySetInnerHTML={{ __html: widgetHtml }}
            />

            {/* QR-код и призыв к действию */}
            <div className="lg:w-1/3 w-full max-w-xs mx-auto lg:mx-0 p-5 bg-white border border-neutral-200 rounded-2xl shadow-lg flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-neutral-800 mb-3">Оставьте свой отзыв!</h3>
                <p className="text-sm text-neutral-600 mb-4">
                    Отсканируйте QR-код, чтобы поделиться своим отзывом о работе с нами. Мы ценим ваше мнение.
                </p>
                
                {/* Использование изображения по публичному пути */}
                <a 
                    href={reviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-40 h-40 border-4 border-emerald-600 rounded-xl mb-4 overflow-hidden flex items-center justify-center bg-gray-100"
                    aria-label="QR-код для перехода на страницу отзывов Яндекс"
                >
                    <img 
                        src={qrCodeImagePath} 
                        alt="QR-код для перехода на страницу отзывов Яндекс"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Если изображение не найдено (404), отображаем стилизованный текст-заменитель и логируем ошибку
                            e.target.style.display = 'none';
                            const parent = e.target.closest('a');
                            if (parent) {
                                parent.classList.add('flex', 'items-center', 'justify-center', 'text-sm', 'text-neutral-500');
                                parent.innerHTML = 'QR-код не найден. Проверьте регистр имени файла в папке /images.';
                            }
                            console.error(`Ошибка загрузки QR-кода. Проверьте путь: ${qrCodeImagePath}. Вероятно, проблема в регистре символов.`);
                        }}
                        loading="lazy"
                    />
                </a>
            </div>

        </div>
    </section>
  );
}

/**
 * Новый компонент для вставки виджета Яндекс.Карты.
 */
function YandexMapWidget() {
    // HTML-код виджета карты, предоставленный пользователем, адаптированный для центрирования и заполнения ширины контейнера
    const mapHtml = `<div style="position:relative;overflow:hidden; max-width: 900px; margin: 0 auto; border-radius: 16px;">
                        <a href="https://yandex.com.tr/maps/org/batura/104037212737/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:0px;left:0; z-index: 10; padding: 4px;">Батура</a>
                        <a href="https://yandex.com.tr/maps/213/moscow/category/construction_company/184107633/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:14px;left:0; z-index: 10; padding: 4px;">Строительная компания в Москве</a>
                        <iframe 
                          src="https://yandex.com.tr/map-widget/v1/org/batura/104037212737/?ll=37.580050%2C55.698696&z=16" 
                          width="100%" 
                          height="400" 
                          frameborder="0" 
                          allowfullscreen="true" 
                          style="position:relative; border-radius: 16px;"
                          title="Карта расположения шоурума Батура"
                        >
                        </iframe>
                    </div>`;

    return (
        <section id="map" className="mx-auto max-w-7xl px-4 py-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Наш шоурум: метро Академическая</h2>
            <div className="grid md:grid-cols-2 gap-6 items-start bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
  {/* Левая колонка: фото шоурума */}
  <div className="w-full h-full">
    <img 
      src="/images/Офис Батура 2.webp" 
      alt="Офис компании Батура" 
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>

  {/* Правая колонка: карта */}
  <div 
    className="w-full h-full"
    dangerouslySetInnerHTML={{ __html: mapHtml }}
  />
</div>

        </section>
    );
}

/**
 * Универсальный компонент для отображения сообщения об успехе после отправки формы.
 * @param {function} onReset - Функция для сброса состояния отправки.
 * @param {string} title - Заголовок сообщения.
 * @param {string} subtitle - Подзаголовок (ожидайте звонка).
 */
function SuccessMessage({ onReset, title, subtitle }) {
  return (
    <div className="p-4 bg-emerald-100 border border-emerald-400 rounded-xl text-center">
        <p className="font-bold text-emerald-700">{title}</p>
        <p className="text-sm text-emerald-600 mt-1">{subtitle}</p>
        <button
            type="button"
            onClick={onReset}
            className="mt-3 text-xs text-neutral-500 underline"
        >
            Вернуться к форме
        </button>
    </div>
  );
}


/* ================= Main App ================= */
export default function UyutLanding() {
  // === State for promo popup ===
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  // Calculate days left until 10 октября 2025
  const promoEndDate = new Date(2025, 9, 10); // Месяцы с 0, октябрь = 9
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((promoEndDate - today) / (1000 * 60 * 60 * 24)));
  
  // Реф для передачи итоговой цены в мобильный футер
  const totalWithPromoRef = useRef(null);
  const [totalWithPromoStr, setTotalWithPromoStr] = useState('');

  // Состояния для форм в блоках Partners и Company
  const [isPromoFormSent, setIsPromoFormSent] = useState(false);
  const [isAppointmentFormSent, setIsAppointmentFormSent] = useState(false);

  // Показывать попап только при попытке ухода (exit intent)
  useEffect(() => {
    if (!PROMO.exitPopupEnabled) return;
    function handleExitIntent(e) {
      // Показываем попап только если мышь ушла за верхнюю границу окна
      if (e.type === 'mouseout' && e.relatedTarget == null && e.clientY <= 0) {
        setShowPromoPopup(true);
      }
      // Альтернатива: если окно потеряло фокус (blur), показываем только если мышь в верхней части экрана
      if (e.type === 'blur' && window.screenY === 0) {
        setShowPromoPopup(true);
      }
    }
    // Добавляем слушатель, только если попап включен в PROMO.exitPopupEnabled
    window.addEventListener('mouseout', handleExitIntent);
    window.addEventListener('blur', handleExitIntent);
    return () => {
      window.removeEventListener('mouseout', handleExitIntent);
      window.removeEventListener('blur', handleExitIntent);
    };
  }, []);
  
  const [activePack, setActivePack] = useState("standard"); // Делаем "Стандарт" активным по умолчанию
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Полноэкранный просмотр: массив изображений и стартовый индекс
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const openModal = ({ images, index = 0 }) => {
    const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
    // Оставляем модальное окно только для десктопа согласно пожеланию, 
    // но рекомендуем адаптировать его для мобильных в будущем.
    if (!isDesktop) return; 
    setModalImages(images || []);
    setModalIndex(index);
  };
  const closeModal = () => {
    setModalImages([]);
    setModalIndex(0);
  };
  // Смещение шапки вниз на высоту промо-полосы
  const promoOffset = PROMO.enabled && daysLeft > 0 ? 32 : 0;
  
  // Рассчитываем новую позицию для липких элементов (шапка + промо + небольшой зазор)
  const STICKY_HEADER = 68;
  const stickyTop = promoOffset + STICKY_HEADER + 24; 

  // URL для Яндекс Навигатора (только для мобильных устройств)
  // const navigatorUrl = `yandexnavi://build_route_on_map?lat_to=55.698696&lon_to=37.580050&zoom=16&description=${encodeURIComponent(CONTACTS.address)}`;

  // Синхронизация строки цены для хедера
  useEffect(() => {
    const id = setInterval(() => {
      if (totalWithPromoRef.current !== null && totalWithPromoRef.current !== totalWithPromoStr) {
        setTotalWithPromoStr(totalWithPromoRef.current);
      }
    }, 250);
    return () => clearInterval(id);
  }, [totalWithPromoStr]);


  /* --- ОБНОВЛЕННАЯ ЛОГИКА ОБРАБОТКИ ФОРМ --- */
  
  // Отправка формы фиксации скидки (Блок Партнеров)
  const handlePromoFormSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name || !payload.phone) return;

    const data = {
        ...payload,
        lead_type: "Promo Fixation (Grand Line block)",
        promo_percent: PROMO.percent,
        promo_until: PROMO.until,
    };
    const success = await sendDataToApi(data, 'GrandLine_Form');
    if (success) {
        setIsPromoFormSent(true);
    } else {
        console.error("Произошла ошибка при отправке заявки на фиксацию скидки.");
    }
  };

  // Отправка формы записи на консультацию (Блок Компании)
  const handleAppointmentFormSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name || !payload.phone) return;

    const data = {
        ...payload,
        lead_type: "Appointment Request (Company Section)",
    };
    const success = await sendDataToApi(data, 'Appointment');
    if (success) {
        setIsAppointmentFormSent(true);
    } else {
        console.error("Произошла ошибка при отправке заявки на консультацию.");
    }
  };

  /* --- КОНЕЦ ОБНОВЛЕННОЙ ЛОГИКИ --- */
  
  return (
    <>
      {/* FOMO Banner: фиксированная полоса над шапкой */}
      {PROMO.enabled && daysLeft > 0 && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-red-600 to-red-400 text-white text-sm font-bold text-center py-1 shadow-lg" style={{minHeight:'32px'}}>
          <span className="mr-2">🔥 До конца акции Grand_Line осталось</span>
          <span className="inline-block px-2 py-0.5 rounded bg-white text-red-700 font-extrabold mx-1">{daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}</span>
          <span className="ml-2">— успейте зафиксировать скидку {Math.round(PROMO.percent*100)} %</span>
        </div>
      )}
      {/* Header (под акцией), смещение задаём пропом */}
      <Header 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        daysLeft={daysLeft}
        promoOffset={promoOffset}
        totalWithPromo={totalWithPromoStr}
      />
    // ...весь остальной код остаётся без изменений...

      {/* Promo Popup (Exit Intent) */}
      {showPromoPopup && daysLeft > 0 && (
        <div className="fixed z-[99999] inset-0 flex items-start justify-center pointer-events-none sm:items-center sm:p-0 p-2">
          <div className="mt-8 sm:mt-8 mt-4 bg-white border-2 border-red-500 shadow-2xl rounded-2xl px-2 sm:px-6 py-4 sm:py-5 max-w-full sm:max-w-md w-full flex flex-col items-center animate-fade-in pointer-events-auto relative">
            <button
              className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 text-2xl font-bold"
              onClick={() => setShowPromoPopup(false)}
              aria-label="Закрыть баннер акции"
              style={{lineHeight:1}}
            >×</button>
            <img src="/images/grandline-logo.webp" alt="Grand Line — партнер акции" className="h-16 mb-2" style={{maxWidth:'200px'}} loading="lazy"/>
            <div className="text-xl font-extrabold text-red-700 text-center mb-1">СКИДКА ДО {PROMO.until} СГОРАЕТ!</div>
            <div className="text-base text-neutral-800 text-center mb-2">До конца акции осталось <b className="text-red-600 text-3xl mx-1">{daysLeft}</b> {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}</div>
            <div className="text-sm text-neutral-600 text-center mb-3">Не упустите персональную скидку {Math.round(PROMO.percent*100)}% на дом вашей мечты.</div>
            
            <button
              type="button"
              onClick={() => {
                setShowPromoPopup(false);
                // Скроллим к секции "Строим только из проверенных материалов!"
                document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="mt-3 w-full px-5 py-3 rounded-xl bg-red-600 text-white font-extrabold text-lg shadow-xl hover:bg-red-700 transition"
            >
              ЗАФИКСИРОВАТЬ СКИДКУ
            </button>
            <p className="text-xs text-neutral-500 mt-2">
                С вами свяжется менеджер для закрепления цены.
            </p>
          </div>
        </div>
      )}

// ...весь остальной код остаётся без изменений...
  {/* Добавляем отступ сверху, равный высоте шапки + промо-полосе */}
  <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ paddingTop: promoOffset + 68 }}>
        <main>
          {/* Hero */}
          <section className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                ⭐ Гарантия 15 лет | Срок 7 недель | Фикс-цена
              </span>
              <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-neutral-900">
                Ваш дом «Уют-71» по фикс-цене — <span className="text-emerald-700">ЗА 7 НЕДЕЛЬ.</span>
              </h1>
              <p className="mt-3 text-red-600 font-semibold">
                {PROMO.bannerText}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Площадь: 71 м²</li>
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Терраса: 15 м²</li>
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Две спальни</li>
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Кухня-гостиная 22 м²</li>
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Потолки 2,7-3,8 м</li>
                <li className="px-3 py-1 rounded-full bg-neutral-200 font-medium">Каркас камерной сушки</li>
                 
                
              </ul>
              <div className="mt-6 flex gap-3 flex-col sm:flex-row">
                <a
                  href="#calc"
                  className="px-6 py-3 sm:px-7 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-extrabold text-base sm:text-lg shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center"
                  aria-label="Рассчитать стоимость дома — быстрый расчет онлайн"
                >
                  <span>Рассчитать и Зафиксировать Цену</span>
                </a>
                {/* ПРАВКА 1: Кнопка ведет на прокрутку к форме CTA */}
                <button
                  onClick={() => scrollToCTA()}
                  className="px-6 py-3 sm:px-7 sm:py-4 rounded-2xl border-2 border-emerald-600 font-bold text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-700 transition-all duration-200 text-base sm:text-lg flex items-center gap-2 justify-center shadow-md"
                  aria-label="Получить бесплатную консультацию от менеджера"
                >
                  <span>Получить бесплатную консультацию</span>
                </button>
              </div>
            </div>
            {/* Главный баннер: слайдер с возможностью зума на десктопе */}
            <div>
              <ImageSlider
                images={HERO_IMAGES}
                small={false}
                onOpen={openModal}
                auto
                interval={5000}
              />
            </div>
          </section>

          {/* Преимущества: Выносим ключевые УТП */}
          <section className="mx-auto max-w-7xl px-4 pt-0 pb-10">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md hover:scale-[1.01] transition duration-200">
                      <p className="text-3xl font-extrabold text-emerald-600">7 недель</p>
                      <p className="text-sm font-semibold text-neutral-700">Гарантия срока строительства</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md hover:scale-[1.01] transition duration-200">
                      <p className="text-3xl font-extrabold text-emerald-600">15 лет</p>
                      <p className="text-sm font-semibold text-neutral-700">Гарантия на все несущие конструкции</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md hover:scale-[1.01] transition duration-200">
                      <p className="text-3xl font-extrabold text-emerald-600">100%</p>
                      <p className="text-sm font-semibold text-neutral-700">Фиксированная цена без скрытых доплат</p>
                  </div>
                                 <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md hover:scale-[1.01] transition duration-200">
                      <p className="text-3xl font-extrabold text-emerald-600">{'>'}350 домов</p>
                      <p className="text-sm font-semibold text-neutral-700">С 2016 года нами реализовано более 350 объектов</p>
                  </div>
              </div>
          </section>

          <FloorPlans openModal={openModal} />
          <Packs activePack={activePack} setActivePack={setActivePack} />
          {/* Передаем stickyTop в Калькулятор */}
          <Calculator activePack={activePack} setActivePack={setActivePack} totalWithPromoRef={totalWithPromoRef} stickyTop={stickyTop} />
        {/* Наши партнеры: Оптимизированный маркетинговый раздел */}
        <section id="partners" className="mx-auto max-w-7xl px-4 py-10">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-4 sm:p-8">
            <h2 className="text-3xl font-extrabold mb-8 text-center text-neutral-900">
                Строим только из проверенных материалов!
            </h2>

            <div className="flex flex-col lg:flex-row items-center gap-8 mb-10 p-6 border border-red-200 bg-red-50 rounded-2xl shadow-lg">
        <div className="flex-shrink-0 w-full lg:w-auto">
          <img src="/images/General/Генеральный партнер 1.webp" alt="Логотип Grand Line — генеральный партнер и поставщик материалов" className="w-full h-auto max-w-sm mx-auto lg:max-w-none lg:h-80" loading="lazy"/>
                </div>
                {/* Add min-w-0 to avoid overflow in flex layout on small screens */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-red-700 mb-2">Генеральный Партнер: Grand_Line</h3>
                    <p className="text-neutral-700 mb-2">
                        Мы получаем материалы напрямую с завода по специальным партнерским ценам, минуя посредников. Это не только гарантирует оригинальное качество, но и позволяет нам предоставлять вам прямые скидки.
                    </p>
                    <div className="inline-block bg-red-100 p-2 rounded-xl border border-red-300 mt-2">
                        <span className="text-lg text-red-700 font-extrabold">
                            🎁 Скидка {Math.round(PROMO.percent*100)}% до {PROMO.until}!
                        </span>
                    </div>

                    {/* Обновленная форма фиксации скидки с сообщением об успехе */}
                    {isPromoFormSent ? (
                      <div className="mt-6">
                        <SuccessMessage
                          title="✅ Ваша скидка зафиксирована!"
                          subtitle="Ждите звонка нашего менеджера для закрепления цены."
                          onReset={() => setIsPromoFormSent(false)}
                        />
                      </div>
                    ) : (
                      <form 
                        className="mt-6 p-4 rounded-xl bg-emerald-50 shadow-inner border border-emerald-200" 
                        onSubmit={handlePromoFormSubmit}
                      >
                          <h4 className="text-md font-bold text-neutral-800 text-center mb-3">Зафиксируйте вашу скидку сейчас!</h4>
                          <input
                              type="text"
                              name="name"
                              required
                              placeholder="Ваше имя"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-300 mb-2"
                          />
                          <input
                              type="tel"
                              name="phone"
                              required
                              placeholder="+7 (XXX) XXX-XX-XX"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-300 mb-3"
                              inputMode="tel"
                              pattern="^((\+7|7|8)[\s\-\(\)]*)?(\d{3})[\s\-\)]*(\d{3})[\s\-]*(\d{2})[\s\-]*(\d{2})$"
                              maxLength={18}
                          />
                          <button
                              type="submit"
                              className="w-full px-4 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                          >
                              ЗАФИКСИРОВАТЬ СКИДКУ
                          </button>
                      </form>
                    )}
                </div>
            </div>

            {/* Блок 2: Специализированные поставщики (Комфорт и Тепло) */}
            <div className="grid md:grid-cols-3 gap-6 pt-4">
                
                {/* Окна REHAU */}
                <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200 shadow-md">
                    <img src="/images/логотип Rehau.webp" alt="Логотип Rehau — профили для окон" className="h-16 w-auto mb-2" style={{maxWidth:'80px'}} loading="lazy"/>
                    <span className="text-sm font-bold text-neutral-800">Окна REHAU</span>
                    <span className="text-xs text-neutral-500 text-center mt-1">
                        Энергоэффективность и долговечность. Вы получаете оригинальный немецкий профиль, который сохраняет тепло и не требует регулировки годами.
                    </span>
                </div>
                
                {/* Утеплитель KNAUF */}
                <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200 shadow-md">
                    <img src="/images/логотип кнауф.webp" alt="Логотип Knauf — теплоизоляция" className="h-16 w-auto mb-2" style={{maxWidth:'80px'}} loading="lazy"/>
                    <span className="text-sm font-bold text-neutral-800">Утеплитель KNAUF</span>
                    <span className="text-xs text-neutral-500 text-center mt-1">
                        Здоровье и Экология. Используем только безопасную, негорючую и экологически чистую теплоизоляцию, рекомендованную для жилых домов.
                    </span>
                </div>
                
                {/* Изоляция ТЕХНОНИКОЛЬ */}
                <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200 shadow-md">
                    <img src="/images/лого технониколь.webp" alt="Логотип Технониколь — изоляционные материалы" className="h-16 w-auto mb-2" style={{maxWidth:'80px'}} loading="lazy"/>
                    <span className="text-sm font-bold text-neutral-800">Изоляция ТЕХНОНИКОЛЬ</span>
                    <span className="text-xs text-neutral-500 text-center mt-1">
                        Надежная защита от влаги. Базальтовый утеплитель. Изоляционные пленки для максимальной защиты каркаса от конденсата и влаги.
                    </span>
                </div>
            </div>

          </div>
        </section>
          <Gallery openModal={openModal} />
          
          {/* БЛОК: Отзывы Яндекс.Бизнес */}
          {/* В этом блоке "sticky" не используется */}
          <YandexReviewsWidget />


          {/* Добавленный блок Гарантии */}
          <section id="guarantee" className="mx-auto max-w-7xl px-4 py-8 bg-neutral-900 text-white rounded-2xl my-8 shadow-xl">
              <h2 className="text-3xl font-extrabold text-center mb-6">Ваша уверенность в результате</h2>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                      <p className="text-5xl mb-2">🛡️</p>
                      <h3 className="font-bold text-xl mb-1 text-emerald-400">Гарантия Срока</h3>
                      <p className="text-neutral-300 text-sm">Если не уложимся в 7 недель — компенсируем ваши расходы на аренду жилья до сдачи дома.</p>
                  </div>
                  <div className="text-center">
                      <p className="text-5xl mb-2">🔒</p>
                      <h3 className="font-bold text-xl mb-1 text-emerald-400">Фиксированная Цена</h3>
                      <p className="text-neutral-300 text-sm">Цена, указанная в договоре, не меняется. Строительство без скрытых доплат и непредвиденных расходов.</p>
                  </div>
                  <div className="text-center">
                      <p className="text-5xl mb-2">🏅</p>
                      <h3 className="font-bold text-xl mb-1 text-emerald-400">Контроль Качества</h3>
                      <p className="text-neutral-300 text-sm">Собственные бригады и независимый технический надзор на каждом этапе работ.</p>
                  </div>
              </div>
          </section>

          {/* Process Section (from original App.js) */}
          <section id="process" className="mx-auto max-w-7xl px-4 py-8">
            <h2 className="text-2xl font-bold mb-3">График работ: Как получить дом за 7 недель</h2>
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-neutral-300 hidden md:block"></div>
              <ol className="grid md:grid-cols-2 gap-8">
                {[
                  ["Выбор комплектации и фикс-цена","Фиксируем комплектацию, цену и срок строительства. Подписываем договор."],
                  ["Предоплата 30% - монтаж фундамента (1 неделя)","Первый взнос. Выезд инженера на участок. Геодезия. Монтаж фундамента. "],
                  ["Оплата 30% - комплектация дома (2 недели)","Второй взнос после монтажа фундамента. Готовим все элементы домокомплекта."],
                  ["Оплата 30% - строительство дома (3-4 недели)","Доставляем домокомплект и начинаем монтаж каркаса дома, под контролем технадзора. Вносим следующую оплату."],
                  ["Сдача готового дома (7 неделя)","Исправляем замечания. Сдаем дом по акту. Убираем площадку и вывозим весь мусор."],
                  ["Финальная оплата 10% - начало гарантийного периода","После полной приемки вносим финальный платеж. Начинается отсчет вашей 15-летней гарантии."],
                ].map(([title, text], idx) => (
                  <li
                    key={idx}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-4 ${
                      idx % 2 === 1 ? "md:col-start-2" : ""
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-2xl shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 w-full shadow-md">
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-neutral-600 mt-1">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Geography Section */}
          <section id="geography" className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-extrabold mb-2 text-neutral-900">Мы работаем для вас в радиусе 200 км от Москвы</h2>
                <p className="text-lg text-emerald-700 font-semibold mb-4">Личный контроль качества на каждом объекте</p>
                <p className="text-neutral-700 mb-4">Ваш дом всегда под нашим контролем. Мы работаем только в радиусе 200 км от МКАД, чтобы обеспечить личный, оперативный контроль за объектами. Поэтому можем гарантировать качество, соблюдение технологии и сдачу дома в срок.</p>
              </div>
              <div>
                <img src="/images/География строительства.webp" alt="География строительства компании «Батура»" className="w-full rounded-2xl border border-neutral-200 shadow-xl" loading="lazy" />
              </div>
            </div>
          </section>
          
          {/* Company Section (ФИНАЛЬНОЕ ОБНОВЛЕНИЕ) */}
          <section id="company" className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              {/* Левая колонка: О компании и Фото */}
              <div itemScope itemType="http://schema.org/AboutPage" className="space-y-6">
                <h2 className="text-3xl font-extrabold mb-2 text-neutral-900">О компании «БАТУРА»</h2>
                <p className="text-lg text-emerald-700 font-semibold mb-4">
                  С 2016 года строим надежные каркасные дома — честно, в срок, по фиксированной цене.
                </p>
                <ul className="mt-3 text-base text-neutral-700 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Постоянные бригады и независимый технадзор</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Собственное производство в г.Шарья</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Гарантия от 15 лет по договору</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Построено более 350 домов</li>
                                  </ul>
                {/* Фотография шоурума */}
                <div className="w-full overflow-hidden rounded-2xl shadow-xl">
                  <img 
                    src="/images/Офис Батура.webp" 
                    alt="Уютный, современный шоурум компании «Батура» в Москве" 
                    className="w-full h-auto object-cover border border-neutral-200" 
                    loading="lazy" 
                  />
                </div>
              </div>
                          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl space-y-6 sticky top-24 h-fit" itemScope itemType="http://schema.org/LocalBusiness">
                <h3 className="font-extrabold text-xl mb-3 text-center text-neutral-900">Приезжайте в наш офис: метро Академическая</h3>
                <meta itemProp="name" content="Батура. Строительство каркасных домов" />
                
                <div className="flex flex-col gap-4">
                                        <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="flex flex-col items-center">
                                                    <img
                            src="/images/qrcod_маршрут в офис.webp"
                            alt="QR-код для прокладывания маршрута в шоурум Батура на Яндекс Картах"
                            className="w-36 h-36 object-contain border-4 border-emerald-500 rounded-lg shadow-md"
                            loading="lazy"
                          />
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">Маршрут к бесплатной офисной парковке</p>
                    </div>
                    
                    {/* Детали контактов (выравнивание по правому краю) */}
                    <div className="space-y-3">
                        <p className="text-base font-semibold text-neutral-700 flex justify-between items-center">
                           <span className="flex items-center text-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             Адрес:
                           </span>
                           <span className="text-right text-base">
                               <span itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
                                   <span itemProp="addressLocality">Москва</span>, <span itemProp="streetAddress">{CONTACTS.address}</span>
                               </span>
                               <span className="block text-sm text-neutral-500">({CONTACTS.address2})</span>
                           </span>
                        </p>

                        <p className="text-base font-semibold text-neutral-700 flex justify-between items-center">
                            <span className="flex items-center text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.5l1.5 4h-3L7 11h3.5l1.5 4h-3l-1.5 4h10l-1.5-4h-3l-1.5-4h-3.5a2 2 0 01-2-2v-2" /></svg>
                                График:
                            </span>
                            <span itemProp="openingHours" className="font-normal ml-1 text-right">{CONTACTS.hours}</span>
                        </p>
                        
                        <div className="border-t pt-3 space-y-2">
                           <p className="text-base font-semibold text-neutral-700 flex justify-between items-center">
                             <span className="flex items-center text-sm">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H5a2 2 0 01-2-2V5z" /></svg>
                               Телефон: 
                             </span>
                             <a className="text-emerald-600 hover:underline font-extrabold text-right" href={`tel:${CONTACTS.phoneHref}`} itemProp="telephone" aria-label="Позвонить в офис продаж">
                               {CONTACTS.phone}
                             </a>
                           </p>
                           <p className="text-sm flex justify-between items-center text-neutral-600">
                              <span className="flex items-center text-sm">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                               E-mail: 
                              </span>
                             <a className="underline text-neutral-600 font-normal text-right" href={`mailto:${CONTACTS.email}`} itemProp="email" aria-label="Написать на email">
                               {CONTACTS.email}
                             </a>
                           </p>
                        </div>
                    </div>
                </div>
                
                {/* Форма записи на консультацию с сообщением об успехе */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-bold text-lg mb-3 text-center">Записаться на консультацию</h4>
                  {isAppointmentFormSent ? (
                      <SuccessMessage
                        title="✅ Заявка на консультацию отправлена!"
                        subtitle="Мы перезвоним вам в ближайшее время для подтверждения."
                        onReset={() => setIsAppointmentFormSent(false)}
                      />
                  ) : (
                    <form onSubmit={handleAppointmentFormSubmit} className="space-y-3">
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ваше имя"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                        />
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="+7 (XXX) XXX-XX-XX"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                            inputMode="tel"
                            pattern="^((\+7|7|8)[\s\-\(\)]*)?(\d{3})[\s\-\)]*(\d{3})[\s\-]*(\d{2})[\s\-]*(\d{2})$"
                            maxLength={18}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                              type="date"
                              name="appointment_date"
                              placeholder="Дата"
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                          />
                          <input
                              type="time"
                              name="appointment_time"
                              placeholder="Время"
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                          />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-3 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-lg" 
                            aria-label="Записаться на консультацию"
                        >
                            ЗАПИСАТЬСЯ
                        </button>
                        <p className="text-xs text-neutral-500 text-center">
                          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
                        </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

            {/* Карта Яндекс.Карты */}
          <YandexMapWidget />

                    <section id="cta" className="bg-neutral-900 text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-emerald-400">С чего начать? Три простых шага к своему дому:</h2>
                <p className="mt-2 text-neutral-300 font-semibold">
                  Отправьте свои пожелания — перезвоним, подберем комплектацию и зафиксируем цену.
                </p>
                <ol className="mt-4 text-base text-neutral-100 space-y-2 list-decimal list-inside font-semibold">
                  <li>Выберите комплектацию в калькуляторе выше (например, "Хит продаж: ОПТИМА")</li>
                  <li>Получите фикс-смету и подпишите договор</li>
                  <li>Через 7 недель после начала строительства вы въезжаете в свой дом</li>
                </ol>
                <p className="mt-4">
                    <span className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800 border-2 border-emerald-500 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                        <span className="text-base font-semibold text-neutral-100">
                             Если не уложимся в срок, <b className="text-emerald-400">мы компенсируем</b> ваши расходы на аренду жилья. Это прописано в договоре.
                        </span>
                    </span>
                   </p>
              </div>
              <form className="bg-white text-neutral-900 rounded-2xl p-6 space-y-4 shadow-2xl" onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = Object.fromEntries(fd.entries());

                  const data = {
                    ...payload,
                    lead_type: "Consultation CTA",
                  };
                  
                  const success = await sendDataToApi(data, 'CTA_Block');
                  
                  if (success) {
                    // Используем SuccessMessage (хотя бы консольный вывод) или делаем редирект на #calc
                    // Для CTA блока, где нет isSent state, пока оставим логику:
                    e.target.reset(); // Очистка формы
                    const button = e.target.querySelector('button[type="submit"]');
                    if (button) {
                        button.textContent = "✅ Заявка отправлена!";
                        button.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                        button.classList.add('bg-green-600');
                        setTimeout(() => {
                           button.textContent = "ОТПРАВИТЬ ЗАЯВКУ";
                           button.classList.remove('bg-green-600');
                           button.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                        }, 3000);
                    }
                  } else {
                    console.error("Произошла ошибка при отправке заявки. Пожалуйста, позвоните нам.");
                  }
                }}>
                {/* ПРАВКА 1: Новый заголовок для формы консультации */}
                <h3 className="text-xl font-bold text-center">Получить бесплатную консультацию</h3>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ваше имя"
                  className="w-full px-3 py-3 rounded-xl border-2 border-neutral-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+7 (XXX) XXX-XX-XX — Телефон"
                  className="w-full px-3 py-3 rounded-xl border-2 border-neutral-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                  inputMode="tel"
                  pattern="^((\+7|7|8)[\s\-\(\)]*)?(\d{3})[\s\-\)]*(\d{3})[\s\-]*(\d{2})[\s\-]*(\d{2})$"
                  maxLength={18}
                />
                
                {/* ПРАВКА 1: Поле с вопросом "С чего начать?" */}
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="С чего начать? (Ваши пожелания или вопросы)"
                  className="w-full px-3 py-3 rounded-xl border-2 border-neutral-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                />
                <div>
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                    <input type="checkbox" name="promos" defaultChecked className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500" />{" "}
                    получать новые акции и спецпредложения
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-lg shadow-xl hover:bg-emerald-700 transition"
                >
                  ОТПРАВИТЬ ЗАЯВКУ
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
                </p>
              </form>
            </div>
          </section>

                    <section id="faq" className="mx-auto max-w-7xl px-4 py-10 pb-24" itemScope itemType="http://schema.org/FAQPage">
            <h2 className="text-2xl font-bold mb-4">Отвечаем на ваши частые вопросы</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["Нужно ли тратить время на проектирование?",
                 "Нет - проект уже готов. Вы выбираете комплектацию и отделку, а мы сразу приступаем к производству. Это экономит много времени"],
                ["Правда, что дом можно построить всего за 7 недель?",
                 "Да, это реально. Уже за 2 недели подготовим домокомплект на производстве, а ещё через 4–5 недель вы сможете пригласить гостей на новоселье. Гарантия срока прописана в договоре."],
                ["Какой порядок оплат?",
                 "Максимально прозрачно: 30% — старт; 30% — после фундамента; 30% — после доставки домокомплекта; 10% — после финальной сдачи дома."],
                ["Цена действительно фиксированная?",
                 "Да, 100%. Никаких скрытых доплат — всё, что в смете, останется неизменным до сдачи дома. Мы берём риски роста цен на себя."],
                ["Какая гарантия?",
                 "На все несущие конструкции, включая фундамент и каркас, действует гарантия 15 лет. Контроль качества осуществляет независимый технадзор."],
                ["Какие есть дополнительные расходы?",
                 "Цена доставки и бытовки рассчитывается индивидуально в зависимости от местоположения участка. От вас нужно только электричество и возможность подъехать к участку."],
              ].map(([q, a], i) => (
                <details key={i} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300" itemScope itemProp="mainEntity" itemType="http://schema.org/Question">
                  <summary className="font-semibold cursor-pointer text-neutral-900" itemProp="name">{q}</summary>
                  <div className="text-sm text-neutral-700 mt-2" itemScope itemProp="acceptedAnswer" itemType="http://schema.org/Answer">
                    <p itemProp="text">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>
        {/* Виджеты мессенджеров для мобильной версии */}
        <div className="fixed right-4 bottom-24 z-40 md:hidden flex flex-col gap-2">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACTS.phoneHref.replace(/[^\d]/g, '')}?text=Здравствуйте! Интересует строительство дома «Уют-71».`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Написать в WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.347"/>
            </svg>
          </a>
                    {/* Telegram */}
          <a
            href={`https://t.me/${CONTACTS.phoneHref.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
        </div>

        {/* Мобильное фиксированное меню CTA */}
        <footer className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 border-t border-neutral-200" role="contentinfo">
          <nav aria-label="Мобильное меню CTA">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <a
                href="#calc"
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold hover:bg-emerald-700 transition shadow-lg text-sm flex items-center justify-center gap-1" 
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#calc form');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                 РАСЧЕТ ЦЕНЫ
              </a>
            </div>
          </nav>
        </footer>
      </div>
      {/* Полноэкранная галерея (десктоп) */}
      {modalImages.length > 0 && (
        <Modal images={modalImages} startIndex={modalIndex} onClose={closeModal} />
      )}
    </>
  );
}
