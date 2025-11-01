import React, { useMemo, useState, useRef, useEffect } from "react";
import InputMask from "react-input-mask";
import "./index.css";
// import { Helmet } from "react-helmet";
import { sendDataToApi, generateComments } from "./config/bitrix24";
import { SmartCaptcha } from "./SmartCaptcha";

// ====================================================================
// ==================== ИМПОРТ ИЗОБРАЖЕНИЙ (Относительные пути для Webpack) =============
// ====================================================================
import logoUrl from "./images/logo-batura.webp";
import grandlineLogoUrl from "./images/grandline-logo.webp";
import rehauLogoUrl from "./images/rehau-logo.webp";
import knaufLogoUrl from "./images/knauf-logo.webp";
import technonicolLogoUrl from "./images/technonicol-logo.webp";
import sberbankLogoUrl from "./images/sberbank-logo.webp";
import domrfLogoUrl from "./images/domrf-logo.webp";
import vtbLogoUrl from "./images/vtb-logo.webp";
import geoMapUrl from "./images/geography-map.webp";
import officeBaturaUrl from "./images/office-batura-1.webp";
import officeBatura2Url from "./images/office-batura-2.webp";
import qrCodeReviewUrl from "./images/qrcode-review.webp";
import qrCodeRouteUrl from "./images/qrcode-route.webp";

// Конфигурация
import { CONTACTS } from './config/contacts';
import { PROMO } from './config/promo';
import { PACKS, ADDONS } from './config/packs';

// Комплектации
import standard1 from "./images/pack-standard-1.webp";
import standard2 from "./images/pack-standard-2.webp";
import optima1 from "./images/pack-optima-1.webp";
import optima2 from "./images/pack-optima-2.webp";
import luxe1 from "./images/pack-luxe-1.webp";
import luxe2 from "./images/pack-luxe-2.webp";

// Hero и Генеральный партнер
import heroBanner1 from "./images/General/hero-banner-1.webp";
import generalPartner1 from "./images/General/general-partner-1.webp";
import generalPartner_vertical from "./images/General/general-partner-vertical.webp";
import heroBanner2 from "./images/General/hero-banner-2.webp";
import heroBanner3 from "./images/General/hero-banner-3.webp";
import heroBanner4 from "./images/General/hero-banner-4.webp";

// Планировки
import floorplanEmpty from "./images/floorplan-empty.webp";
import floorplanFurnished from "./images/floorplan-furnished.webp";

// Галерея (для каждого проекта нужно импортировать все фото)
import izumrudozero1 from "./images/Example/izumrudozero-1.webp";
import izumrudozero2 from "./images/Example/izumrudozero-2.webp";
import izumrudozero3 from "./images/Example/izumrudozero-3.webp";
import kaluga1 from "./images/Example/kaluga-1.webp";
import kaluga2 from "./images/Example/kaluga-2.webp";
import kaluga3 from "./images/Example/kaluga-3.webp";
import kaluga4 from "./images/Example/kaluga-4.webp";
import kaluga5 from "./images/Example/kaluga-5.webp";
import solnechnogorsk1 from "./images/Example/solnechnogorsk-1.webp";
import solnechnogorsk2 from "./images/Example/solnechnogorsk-2.webp";
import solnechnogorsk3 from "./images/Example/solnechnogorsk-3.webp";
import solnechnogorsk4 from "./images/Example/solnechnogorsk-4.webp";

// ====================================================================

/* ================= Utils ================= */
// Функция форматирования числа в рубли
function rub(n) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

// Функция проверки, что номер телефона введен полностью по маске +7 (999) 999-99-99
// Возвращает true, если номер содержит 11 цифр (полностью заполнен)
function isValidPhone(phone) {
  if (!phone) return false;
  // Удаляем все нецифровые символы и проверяем, что осталось 11 цифр
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits[0] === '7';
}

// Компонент защищенного изображения (только защита от сохранения, без водяных знаков)
function ProtectedImage({ src, alt, className, style, loading, onClick, ...props }) {
  const handleContextMenu = (e) => {
    e.preventDefault(); // Блокируем правый клик
  };

  const handleDragStart = (e) => {
    e.preventDefault(); // Блокируем перетаскивание
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...style, userSelect: 'none' }}
      loading={loading}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      draggable={false}
      {...props}
    />
  );
}


// Data definitions

// Используем импортированную переменную
const LOGO_URL = logoUrl;

const PHOTOS = {
  main: generalPartner1, // Используем импортированную переменную
  standard: [
    standard1,
    standard2,
  ],
  optima: [
    optima1,
    optima2,
  ],
  luxe: [
    luxe1,
    luxe2,
  ],
};
// Изображения для главного баннера (Hero)
const HERO_IMAGES = [
  heroBanner1,
  heroBanner2,
  heroBanner3,
  heroBanner4,
];
const FLOORPLANS = {
  empty: floorplanEmpty,
  furnished: floorplanFurnished,
};

const GALLERY = [
  {
    location: "Можайск. КП «Изумрудное Озеро»", date: "декабрь 2024", pack: "ЭКСТРА (квадро-брус)",
    images: [izumrudozero3, izumrudozero1, izumrudozero2],
  },
  {
    location: "Калужская область. Желыбино", date: "март 2025", pack: "ЭКСТРА",
    images: [kaluga1, kaluga2, kaluga3, kaluga4, kaluga5],
  },
  {
    location: "Московская область. Солнечногорск", date: "октябрь 2024", pack: "СТАНДАРТ",
    images: [solnechnogorsk1, solnechnogorsk2, solnechnogorsk3, solnechnogorsk4],
  },
];



/* ================= Components ================= */

// Функция для прокрутки к блоку CTA
// Улучшенная функция smooth scroll с полифиллом для мобильных браузеров
const smoothScrollTo = (element, options = {}) => {
  if (!element) return;
  
  // Проверяем поддержку smooth scroll
  const supportsNativeScrollBehavior = 'scrollBehavior' in document.documentElement.style;
  
  if (supportsNativeScrollBehavior) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', ...options });
  } else {
    // Полифилл для браузеров без поддержки smooth scroll
    const targetPosition = element.offsetTop - (window.innerHeight / 2) + (element.offsetHeight / 2);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      
      window.scrollTo(0, startPosition + (distance * ease));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    requestAnimationFrame(animation);
  }
};

const scrollToCTA = (setIsMenuOpen) => {
    // Если меню открыто, закрываем его
    if (setIsMenuOpen) setIsMenuOpen(false);
    // Прокрутка к секции #cta с улучшенным smooth scroll
    const element = document.getElementById('cta');
    smoothScrollTo(element);
};

function Header({ isMenuOpen, setIsMenuOpen, daysLeft, promoOffset = 0, totalWithPromo, priceAnimated }) {

  // Высота шапки (в пикселях) для позиционирования мобильного меню
  const HEADER_HEIGHT = 68;

  // Автоматическое закрытие мобильного меню при прокрутке или клике вне меню
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (isMenuOpen) {
        // Проверяем, что клик не по кнопке меню и не внутри меню
        const menuButton = event.target.closest('[aria-label="Открыть мобильное меню"]');
        const mobileMenu = event.target.closest('nav[aria-label="Мобильная навигация"]');
        
        if (!menuButton && !mobileMenu) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <>
      {/* Шапка фиксированная, сдвигаем вниз на высоту промо-полосы */}
      <header className="fixed z-50 bg-white shadow-md w-full" style={{ top: promoOffset }}>
  <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Мобильная кнопка меню - слева */}
        <button
          className="md:hidden p-2 rounded bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Открыть мобильное меню"
        >
          ☰
        </button>
        
        {/* Логотип - ближе к кнопке меню на мобиле */}
   <a
  href="#top"
  className="flex items-center gap-3 md:ml-0 ml-2"
  onClick={(e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  <img
    src={LOGO_URL} // ИСПОЛЬЗУЕМ ИМПОРТ
    alt="Логотип компании Батура"
    className="h-14 w-auto"   
  />
  <span className="block font-bold text-base sm:text-lg">
    Каркасный дом «Уют-71.ФИКС»
  </span>
</a>
        <nav className="hidden md:flex gap-6 text-sm font-medium" aria-label="Основная навигация">
          <a href="#calc" className="hover:text-neutral-600 transition">
            Цена
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
            <span className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-neutral-200 text-emerald-700 font-extrabold text-sm transition-all duration-300 ${priceAnimated ? 'animate-pulse bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-105 border-emerald-300' : ''}`}>
              <span className={`hidden lg:inline font-semibold text-emerald-700 transition-all duration-300 ${priceAnimated ? 'text-emerald-800' : ''}`}>ВСЕГО</span>
              <span className={`text-base transition-all duration-300 ${priceAnimated ? 'text-emerald-800 scale-110 font-black' : ''}`}>{totalWithPromo}</span>
              <a
                href="#calc"
                className={`ml-1 px-2 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold shadow hover:from-red-600 hover:to-red-800 transition-all duration-300 ${priceAnimated ? 'animate-bounce bg-gradient-to-r from-red-600 to-red-800' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#calc form');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                СМЕТА
              </a>
            </span>
          )}
        </div>
      </div>
      </header> 

      {/* Мобильное меню */}
      <nav
        className={`md:hidden bg-white border-t px-4 py-3 space-y-3 text-sm transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'} fixed w-full z-40 shadow-lg`}
        style={{ 
          top: HEADER_HEIGHT,
          transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          willChange: 'transform'
        }}
        aria-label="Мобильная навигация"
      >
          <a href="#calc" className="block hover:text-neutral-600" onClick={(e) => {
            e.preventDefault();
            setIsMenuOpen(false);
            // Скролл к заголовку "Калькулятор стоимости"
            setTimeout(() => {
              const headings = document.querySelectorAll('h3');
              let targetElement = null;
              
              for (const heading of headings) {
                if (heading.textContent && heading.textContent.includes('Калькулятор стоимости')) {
                  targetElement = heading;
                  break;
                }
              }
              
              if (targetElement) {
                const elementRect = targetElement.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.pageYOffset;
                const targetPosition = absoluteElementTop - 100;
                
                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });
              } else {
                // Фоллбэк - скролл к секции calc
                const calcSection = document.getElementById('calc');
                if (calcSection) {
                  calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }, 300);
          }}>
            Цена
          </a>
          <a href="#reviews" className="block hover:text-neutral-600" onClick={() => setIsMenuOpen(false)}>
            Отзывы
          </a>
          <a href="#company" className="block hover:text-neutral-600" onClick={(e) => {
            e.preventDefault();
            setIsMenuOpen(false);
            // Скролл к форме "Записаться на консультацию"
            setTimeout(() => {
              // Ищем все h4 элементы и находим нужный
              const headings = document.querySelectorAll('h4');
              let targetElement = null;
              
              for (const heading of headings) {
                if (heading.textContent && heading.textContent.includes('Записаться')) {
                  targetElement = heading;
                  break;
                }
              }
              
              if (targetElement) {
                const elementRect = targetElement.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.pageYOffset;
                const targetPosition = absoluteElementTop - 100;
                
                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });
              } else {
                // Фоллбэк - скролл к секции company
                const companySection = document.getElementById('company');
                if (companySection) {
                  companySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }, 300); // Увеличиваем время ожидания
          }}>
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
              className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:from-blue-600 hover:to-blue-800 transition"
              onClick={() => scrollToCTA(setIsMenuOpen)}
              aria-label="Заказать обратный звонок"
            >
              📞 Перезвоните мне
            </button>
          </div>
        </nav>
        
        {/* Отступ перенесён в основной контейнер страницы */}
    </>
  );
}

// ImageSlider Component (from App2.js)
function ImageSlider({ images = [], small = false, onOpen, auto = false, interval = 5000, heroMode = false }) {
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
      className={`relative ${
        heroMode ? "w-full h-full" : 
        small ? "aspect-[3/2] w-full h-64" : "h-[380px] w-full lg:h-[450px]"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }}
      onMouseLeave={() => { /* перезапуск таймера произойдёт через effect */ }}
    >
      <div className={`absolute inset-0 overflow-hidden ${heroMode ? "rounded-none" : "rounded-xl"}`}>
        {images.map((src, i) => (
          <ProtectedImage
            key={i}
            src={src}
            alt={`Фото ${i + 1}`}
            // Замена на loading="eager" для первого изображения Hero для FCP (First Contentful Paint)
            loading={auto && i === 0 ? "eager" : "lazy"} 
            className={`absolute inset-0 w-full h-full ${heroMode ? "object-cover object-center" : "object-cover"} transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
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

  // Блокируем скролл body при открытом модальном окне
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
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
      <ProtectedImage
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

// Order Modal Component
function OrderModal({ isOpen, onClose, pack, onSubmit, isSubmitted, daysLeft }) {
  if (!isOpen || !pack) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    
    if (!payload.name || !payload.phone) return;

    const data = {
      ...payload,
      lead_type: "Pack Interest",
      pack_key: pack.key,
      pack_label: pack.label,
      pack_price: pack.basePrice,
    };

    const success = await sendDataToApi(data, 'PackOrder');
    
    if (success) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
          <h3 className="text-xl font-bold text-neutral-900 pr-8">
            {pack.label}
          </h3>
          <div className="mt-3 space-y-2">
            <div className="text-sm text-neutral-600">
              Обычная цена: <span className="font-semibold">{rub(pack.basePrice)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-emerald-700 font-medium">
                  🎁 Цена до {PROMO.until}
                </span>
                <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold text-right">
                  <div>Скидка {rub(Math.round(pack.basePrice * PROMO.percent))}</div>
                </div>
              </div>
              <div className="text-xl font-extrabold text-emerald-800">
                {rub(Math.round(pack.basePrice * (1 - PROMO.percent)))}
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="p-6 pb-4">
          <img
            src={PHOTOS[pack.key][0]}
            alt={pack.label}
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>

        {/* Form */}
        <div className="p-6 pt-2">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-emerald-700 mb-2">Заявка отправлена!</h4>
              <p className="text-sm text-neutral-600 mb-4">Мы перезвоним Вам в ближайшее время</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <InputMask
                  mask="+7 (999) 999-99-99"
                  name="phone"
                  required
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  inputMode="tel"
                />
              </div>
              
              <p className="text-xs text-neutral-500 text-center">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
              </p>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-md"
              >
                ОТПРАВИТЬ
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Packs Section (from App.js with App2.js enhancements)
function Packs({ activePack, setActivePack, openModal, onOrderClick, daysLeft }) {
    return (
        <section id="packs" className="mx-auto max-w-7xl px-4 py-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-4">Комплектации и цены</h3>
              
             
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                {Object.values(PACKS).map((p) => (
                    <div
                        key={p.key}
                        // Добавление hover-эффекта для карточек
                        className="text-left rounded-2xl border border-neutral-200 transition hover:shadow-xl hover:scale-[1.01] duration-200"
                    >
                        <div className="relative">
                            <ImageSlider images={PHOTOS[p.key]} small onOpen={openModal} />
                            {p.key === "standard" && (
                                <span className="absolute top-2 left-2 text-[10px] uppercase bg-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                                    ⭐ ХИТ ПРОДАЖ
                                </span>
                            )}

                        </div>
                        <div 
                            className="p-4"
                        >
                            <div className="flex flex-col gap-1 mb-2">
                                <h4 className="text-xl font-bold text-neutral-900">{p.label}</h4>
                                <p className="text-sm text-neutral-600">{p.subLabel}</p>
                            </div>
                            {/* Блок цен */}
                            <div className="mb-4 space-y-3">
                                {/* Обычная цена */}
                                <div className="text-sm text-neutral-600">
                                    Обычная цена: <span className="font-semibold">{rub(p.basePrice)}</span>
                                </div>
                                
                                {/* Цена со скидкой */}
                                <div className="bg-emerald-50 border border-emerald-200 px-3 py-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-emerald-700 font-medium">
                                            🎁 Цена до {PROMO.until}
                                        </span>
                                        <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold text-right">
                                            <div>Скидка {rub(Math.round(p.basePrice * PROMO.percent))}</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-extrabold text-emerald-800">
                                        {rub(Math.round(p.basePrice * (1 - PROMO.percent)))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onOrderClick(p)}
                                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-extrabold py-3 px-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                            >
                                ХОЧУ ТАКОЙ ДОМ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


// Calculator Section (from App.js with App2.js enhancements)
  function Calculator({ activePack, setActivePack, totalWithPromoRef, priceAnimated, setPriceAnimated, calculatorCaptchaToken, setCalculatorCaptchaToken, daysLeft }) {
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
    const [mortgageEnabled, setMortgageEnabled] = useState(false);
    const [isSent, setIsSent] = useState(false); // Состояние отправки

    // Recalculate choices defaults when activePack changes
    useEffect(() => {
        const defaults = {};
        Object.entries(pack.choices).forEach(([k, cfg]) => {
            defaults[k] = Object.keys(cfg.options)[0];
        });
        setChoices(defaults);
        setAddons({});
        setMortgageEnabled(false); // Сброс статуса ипотеки
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

    // Обновляем реф для мобильного футера и запускаем анимацию при изменении цены
    useEffect(() => {
      totalWithPromoRef.current = rub(totalWithPromo);
      
      // Запускаем анимацию при изменении цены (если функция передана)
      if (setPriceAnimated) {
        setPriceAnimated(true);
        const timer = setTimeout(() => {
          setPriceAnimated(false);
        }, 600); // Длительность анимации

        return () => clearTimeout(timer);
      }
    }, [totalWithPromo, totalWithPromoRef, setPriceAnimated]);

    const handleCalculatorSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = Object.fromEntries(fd.entries());
        
        if (!payload.name || !payload.phone) return;
        
        // Проверка, что номер телефона введен полностью
        if (!isValidPhone(payload.phone)) {
            alert('Пожалуйста, введите полный номер телефона (+7 (XXX) XXX-XX-XX)');
            return;
        }
        
        // Проверка капчи
        if (!calculatorCaptchaToken) {
            alert('Пожалуйста, подтвердите, что вы не робот, выполнив проверку капчи.');
            return;
        }

        const selectedAddons = ADDONS.filter(a => {
            if (a.isTextField) {
                return addons[a.key] && addons[a.key].trim() !== '';
            }
            return Boolean(addons[a.key]);
        });
        
        // Собираем текстовые поля отдельно для удобства обработки
        const customWishes = addons.custom_wishes && addons.custom_wishes.trim() !== '' 
            ? addons.custom_wishes 
            : null;
        
        const data = {
            ...payload,
            lead_type: "Calculator (Fixed Price)",
            pack_key: activePack,
            pack_label: pack.label,
            total_final: totalWithPromo,
            config_choices: choices,
            config_addons: selectedAddons.map(a => a.label),
            addons_selected_keys: selectedAddons.map(a => a.key),
            custom_wishes: customWishes,
            // Добавляем все расчетные данные для удобства Bitrix
            base_price: basePrice,
            choices_sum: choicesSum,
            addons_sum: addonsSum,
            promo_amount: promoAmount,
            mortgage_interest: mortgageEnabled,
            captcha_token: calculatorCaptchaToken,
        };

        const success = await sendDataToApi(data, 'Calculator');

        if (success) {
            setIsSent(true);
            setCalculatorCaptchaToken(null); // Сброс токена после успешной отправки
        } else {
            // Резервное сообщение об ошибке
            // Замена alert() на console.error() - для продакшн-кода
            console.error("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или позвоните нам.");
        }
    };

  return (
    <section id="calc" className="mx-auto max-w-7xl px-4 pb-8 lg:pb-8 pb-24 relative">
      <h3 className="text-2xl font-bold mb-6">Узнайте стоимость Вашего дома за 3 шага!</h3>
  <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Этап 1: Выбор комплектации */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
              <h4 className="text-lg font-semibold text-neutral-900">Выберите комплектацию</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-600">Комплектация</label>
                <select
                  value={activePack}
                  onChange={e => setActivePack(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {Object.values(PACKS).map(p => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-600">Базовая цена</label>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-2xl md:text-3xl font-extrabold text-neutral-900">{rub(basePrice)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-5">
              <h5 className="text-base font-semibold mb-3 text-neutral-700">Что входит в комплектацию</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.values(pack.fixedDetails).map((detail, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span dangerouslySetInnerHTML={{ __html: detail }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Этап 2: Настройка конфигурации */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">2</div>
              <h4 className="text-lg font-semibold text-neutral-900">Внесите свои изменения</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(pack.choices).map(([key, cfg]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    {cfg.label}
                  </label>
                  <select
                    value={choices[key]}
                    onChange={(e) =>
                      setChoices((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
          </div>

          {/* Этап 3: Дополнительные услуги */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">3</div>
              <h4 className="text-lg font-semibold text-neutral-900">Добавьте в расчет</h4>
            </div>
            <div className="space-y-4">
              {ADDONS.map((a) => (
                <div key={a.key}>
                  {a.isTextField ? (
                    <div className="p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all">
                      <div className="font-medium text-neutral-900 mb-2">{a.label}</div>
                      <textarea
                        value={addons[a.key] || ""}
                        onChange={(e) =>
                          setAddons((prev) => ({ ...prev, [a.key]: e.target.value }))
                        }
                        placeholder="Опишите ваши пожелания..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                    </div>
                  ) : (
                    <label className="flex items-start justify-between gap-4 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 cursor-pointer transition-all">
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 mb-1">{a.label}</div>
                        <div className="text-sm text-neutral-600">
                          {a.noPrice ? "Цена по запросу*" : `Стоимость: ${rub(a.price)}`}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(addons[a.key])}
                        onChange={(e) =>
                          setAddons((prev) => ({ ...prev, [a.key]: e.target.checked }))
                        }
                        className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 mt-1"
                      />
                    </label>
                  )}
                </div>
              ))}
              <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600">
                  *Услуги без указанной цены рассчитываются индивидуально 
                </p>
              </div>
            </div>
          </div>
        </div>
  {/* Sidebar with calculator summary - NO STICKY */}
  <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h4 className="text-lg font-semibold mb-4">Итоговый краткий расчет</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Комплектация «{pack.label}»</span>
                <span className="font-semibold text-neutral-900">{rub(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Ваши изменения</span>
                <span className="font-semibold text-neutral-900">{choicesSum >= 0 ? `+${rub(choicesSum)}` : rub(choicesSum)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Дополнительно</span>
                <span className="font-semibold text-neutral-900">{addonsSum >= 0 ? `+${rub(addonsSum)}` : rub(addonsSum)}</span>
              </div>
              
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-neutral-900">ИТОГО БЕЗ СКИДКИ</span>
                  <span className="font-extrabold text-xl text-neutral-900">{rub(total)}</span>
                </div>

                {/* Единый блок дополнительных опций */}
                <div className="space-y-3 pb-3 border-b border-neutral-200">
                  
                  {/* Блок ипотеки - минималистичный дизайн */}
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="inline-flex items-center gap-2 font-medium text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded text-neutral-600 focus:ring-neutral-500"
                          checked={mortgageEnabled}
                          onChange={(e) => setMortgageEnabled(e.target.checked)}
                        />
                        <span>Хочу в ипотеку</span>
                      </label>
                      {mortgageEnabled && (
                        <span className="text-xs text-neutral-600 font-medium">от 6,5% годовых</span>
                      )}
                    </div>
                    {/* Логотипы банков - увеличенные для мобильной версии */}
                    <div className="flex items-center justify-center gap-4">
                      <img 
                        src={sberbankLogoUrl} 
                        alt="Сбербанк" 
                        className="h-16 sm:h-20 w-auto object-contain opacity-80" 
                        loading="lazy"
                      />
                      <img 
                        src={domrfLogoUrl} 
                        alt="ДомРФ" 
                        className="h-16 sm:h-20 w-auto object-contain opacity-80" 
                        loading="lazy"
                      />
                      <img 
                        src={vtbLogoUrl} 
                        alt="ВТБ" 
                        className="h-16 sm:h-20 w-auto object-contain opacity-80" 
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Блок акции - в едином стиле */}
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="inline-flex items-center gap-2 font-medium text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded text-neutral-600 focus:ring-neutral-500"
                          checked={promoEnabled}
                          onChange={(e) => setPromoEnabled(e.target.checked)}
                        />
                        <span>Скидка от Grand_Line {PROMO.percent * 100}%</span>
                      </label>
                      {promoEnabled && (
                        <span className="font-semibold text-xl text-red-600">
                          -{rub(promoAmount)}
                        </span>
                      )}
                    </div>
                    {/* Улучшенное напоминание о времени акции */}
                    <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 text-center animate-pulse">
                     ⏰ ЗАФИКСИРУЙ СКИДКУ! Осталось всего {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}!
                    </div>
                  </div>
                </div>
              </div>

              <div className={`border-t border-emerald-500 pt-2 flex justify-between text-base bg-emerald-50 -mx-3 -mb-3 px-3 py-2 rounded-b-xl transition-all duration-300 ${priceAnimated ? 'animate-pulse bg-gradient-to-r from-emerald-100 to-emerald-200 shadow-lg scale-[1.02]' : ''}`}>
                <span className={`font-extrabold text-base text-emerald-700 transition-all duration-300 ${priceAnimated ? 'text-emerald-800' : ''}`}>ЦЕНА СО СКИДКОЙ</span>
                <span className={`font-extrabold text-2xl sm:text-3xl text-emerald-700 transition-all duration-300 ${priceAnimated ? 'text-emerald-800 scale-110' : ''}`}>
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
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    name="phone"
                    required
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-900"
                    inputMode="tel"
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
              
              <p className="text-xs text-neutral-600 text-center mt-2">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
              </p>
              
              <div className="flex justify-center w-full max-w-full overflow-hidden">
                <div className="w-full max-w-xs">
                  <SmartCaptcha 
                    onSuccess={(token) => setCalculatorCaptchaToken(token)} 
                    onError={(error) => console.error('Captcha error:', error)}
                  />
                </div>
              </div>
              
              <div className="mt-2 grid gap-2">
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-xl hover:bg-emerald-700 transition" 
                >
                  Получить расчет и ЗАФИКСИРОВАТЬ Цену
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
        className={`fixed bottom-0 left-0 right-0 z-[9999] bg-emerald-600 shadow-lg transition-all duration-300 ${priceAnimated ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 animate-pulse shadow-2xl' : ''}`}
        style={{
          boxShadow: priceAnimated ? "0 -4px 24px 0 rgba(16, 185, 129, 0.4)" : "0 -2px 16px 0 rgba(0,0,0,0.2)",
          pointerEvents: 'auto',
          display: window.innerWidth >= 1024 ? 'none' : 'block',
        }}
      >
                
        <div className="flex items-center justify-between px-4 py-2">
          <div onClick={() => {
            const el = document.querySelector('#calc form');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }} className="cursor-pointer">
            <span className={`block text-xs text-emerald-100 font-medium transition-all duration-300 ${priceAnimated ? 'text-emerald-50' : ''}`}>Цена со скидкой</span>
            <span className={`block text-2xl font-extrabold text-white transition-all duration-300 ${priceAnimated ? 'scale-110 text-white' : ''}`}>{totalWithPromoRef.current}</span>
          </div>
          <button
            onClick={() => {
              const el = document.querySelector('#calc form');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`ml-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 text-white font-extrabold text-sm shadow-xl hover:bg-red-700 transition-all duration-300 ${priceAnimated ? 'animate-bounce from-red-600 to-red-800 shadow-2xl' : ''}`}
            style={{ pointerEvents: 'auto' }}
          >
            ЗАФИКСИРОВАТЬ
          </button>
        </div>
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
      {/* Микро-CTA для быстрого перехода к комплектациям */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('packs');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-6 py-3 sm:px-7 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-extrabold text-base sm:text-lg shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex items-center gap-2 justify-center"
                  aria-label="Посмотреть комплектации и цены домов"
        >
          Узнать Цены и комплектации
        </button>
      </div>
    </section>
  );
}

// FloorPlan Section (from App.js with App2.js enhancements)
function FloorPlans({ openModal }) {
    return (
        <section id="plans" className="mx-auto max-w-7xl px-4 py-6">
            <h3 className="text-2xl font-bold mb-3">Планировка дома «Уют-71.ФИКС»</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div
                    className="bg-white rounded-2xl border border-neutral-200 p-5 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
                      if (isDesktop) openModal({ images: [FLOORPLANS.empty], index: 0 });
                    }}
                >
                    <h4 className="text-lg font-bold mb-4">Посмотреть площади и размеры</h4>
                    <ProtectedImage
                        src={FLOORPLANS.empty}
                        alt="Планировка дома «Уют-71.ФИКС» без мебели"
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
                    <ProtectedImage
                        src={FLOORPLANS.furnished}
                        alt="Планировка дома «Уют-71.ФИКС» с мебелью"
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
function YandexReviewsWidget({ 
  isFaqCallbackSent, 
  setIsFaqCallbackSent, 
  handleFaqCallbackSubmit, 
  setFaqCallbackCaptchaToken 
}) {
  const reviewsUrl = "https://yandex.ru/maps-reviews-widget/104037212737?comments";
  
  // ИСПРАВЛЕНО: Путь к изображению (Используем импорт)
  const qrCodeImagePath = qrCodeReviewUrl; 
  
  // Состояние для управления открытым FAQ элементом (только один может быть открыт)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Код виджета, предоставленный пользователем, с изменениями для полной ширины.
  const widgetHtml = `<div style="width: 100%; height: 800px; overflow: hidden; position: relative;">
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
        <h2 className="text-3xl font-extrabold mb-6 text-center text-neutral-900">Отзывы наших клиентов</h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Левая колонка: Виджет отзывов */}
            <div className="space-y-4">
                {/* Виджет отзывов */}
                <div className="w-full overflow-hidden rounded-2xl shadow-xl border border-neutral-200">
                    <div 
                        className="w-full"
                        // Для iframe с виджетом используем dangerouslySetInnerHTML
                        dangerouslySetInnerHTML={{ __html: widgetHtml }}
                    />
                </div>
            </div>
            
            {/* Правая колонка: FAQ - NO STICKY */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl space-y-6" itemScope itemType="http://schema.org/FAQPage">
                <h3 className="font-extrabold text-xl mb-2 text-center text-neutral-900">Отвечаем на ваши частые вопросы</h3>
                <p className="text-xs text-neutral-500 text-center mb-4">👆 Нажмите на вопрос, чтобы увидеть ответ</p>
                
                <div className="space-y-3">
                    {[
                        ["Нужно ли тратить время на проектирование?",
                         "Нет - проект уже готов. Вы выбираете комплектацию и отделку, а мы сразу приступаем к производству. Это экономит много времени"],
                        ["Правда, что дом можно построить всего за 7 недель?",
                         "Да, это реально. Уже за 2 недели подготовим домокомплект на производстве, а ещё через 4–5 недель вы сможете пригласить гостей на новоселье. Гарантия срока прописана в договоре."],
                        // ["Какой порядок оплат?",
                        //  "Максимально прозрачно: 30% — старт; 30% — после фундамента; 30% — после доставки домокомплекта; 10% — после финальной сдачи дома."],
                        ["Цена действительно фиксированная?",
                         "Да, 100%. Никаких скрытых доплат — всё, что в смете, останется неизменным до сдачи дома. Мы берём риски роста цен на себя."],
                        ["Какая гарантия?",
                         "На все несущие конструкции, включая фундамент и каркас, действует гарантия 15 лет. Контроль качества осуществляет независимый технадзор."],
                        ["Какие есть дополнительные расходы?",
                         "Цена доставки и бытовки рассчитывается индивидуально в зависимости от местоположения участка. От вас нужно только электричество и возможность подъехать к участку."],
                    ].map(([q, a], i) => (
                        <div 
                            key={i} 
                            className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 hover:bg-white hover:shadow-lg hover:border-emerald-200 transition-all duration-200" 
                            itemScope 
                            itemProp="mainEntity" 
                            itemType="http://schema.org/Question"
                        >
                            <div 
                                className="font-semibold cursor-pointer text-neutral-900 text-base flex items-center justify-between gap-3 select-none" 
                                itemProp="name"
                                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-emerald-600 text-lg flex-shrink-0">❓</span>
                                    <span className="flex-1">{q}</span>
                                </div>
                                <svg 
                                    className={`w-5 h-5 text-emerald-600 transition-transform duration-200 flex-shrink-0 ${openFaqIndex === i ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {openFaqIndex === i && (
                                <div 
                                    className="text-sm text-neutral-700 mt-4 ml-8 leading-relaxed border-l-2 border-emerald-100 pl-4" 
                                    itemScope 
                                    itemProp="acceptedAnswer" 
                                    itemType="http://schema.org/Answer"
                                >
                                    <p itemProp="text">{a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Призыв к действию в FAQ блоке */}
                        <div className="border-t border-neutral-200 pt-6">
                          <p className="text-base text-neutral-600 mb-4 text-center font-medium">Остались вопросы?</p>
                          
                          {/* Форма для десктопа */}
                    <div className="hidden md:block">
                      {isFaqCallbackSent ? (
                        <SuccessMessage
                          title="✅ Заявка принята!"
                          subtitle="Ожидайте звонка нашего менеджера."
                          onReset={() => setIsFaqCallbackSent(false)}
                        />
                      ) : (
                        <form className="space-y-3 max-w-md mx-auto" onSubmit={handleFaqCallbackSubmit}>
                          
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ваше имя"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <InputMask
                            mask="+7 (999) 999-99-99"
                            name="phone"
                            required
                            placeholder="+7 (XXX) XXX-XX-XX"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            inputMode="tel"
                          />
                          
                          <p className="text-xs text-neutral-600">
                            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
                          </p>
                          
                          <div className="flex justify-center">
                            <SmartCaptcha 
                              onSuccess={(token) => setFaqCallbackCaptchaToken(token)} 
                              onError={(error) => console.error('Captcha error:', error)}
                            />
                          </div>
                          
                          <button
                            type="submit"
                            className="w-full px-4 py-3 font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg transition-all"
                          >
                            ПЕРЕЗВОНИТЕ МНЕ
                          </button>
                        </form>
                      )}
                    </div>
                    
                    {/* Три кнопки для мобильной версии */}
                    <div className="md:hidden flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <a 
                            href={`tel:${CONTACTS.phoneHref}`}
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H5a2 2 0 01-2-2V5z" />
                            </svg>
                            Позвонить консультанту  
                        </a>
                        
                        <a 
                            href={`https://t.me/${CONTACTS.phoneWhatsapp.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.308.02.475z"/>
                            </svg>
                            TELEGRAM
                        </a>
                        
                        <a 
                            href={`https://wa.me/${CONTACTS.phoneWhatsapp.replace(/[^\d]/g, '')}?text=Здравствуйте! У меня есть вопросы о строительстве дома «Уют-71.ФИКС».`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.347"/>
                            </svg>
                            WHATSAPP
                        </a>
                    </div>
                </div>
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
            <h2 className="text-2xl font-bold mb-6 text-center">Шоурум метро Академическая</h2>
            <div className="grid md:grid-cols-2 gap-6 items-start bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
  {/* Левая колонка: фото шоурума */}
  <div className="w-full h-full">
    <ProtectedImage 
      src={officeBatura2Url} // ИСПОЛЬЗУЕМ ИМПОРТ
      alt="Офис строительной компании Батура" 
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
function UyutLanding() {
  // === State for catalog popup ===
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [projectPrices, setProjectPrices] = useState({});
  // Calculate days left until promo end date
  const promoEndDate = new Date(PROMO.endDate.year, PROMO.endDate.month - 1, PROMO.endDate.day); // Месяцы с 0, поэтому month - 1
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((promoEndDate - today) / (1000 * 60 * 60 * 24)));
  
  // Реф для передачи итоговой цены в мобильный футер
  const totalWithPromoRef = useRef(null);
  const [totalWithPromoStr, setTotalWithPromoStr] = useState('');
  const [priceAnimated, setPriceAnimated] = useState(false); // Глобальное состояние анимации цены

  // Состояния для форм в блоках Partners и Company
  const [isPromoFormSent, setIsPromoFormSent] = useState(false);
  const [isAppointmentFormSent, setIsAppointmentFormSent] = useState(false);
  const [isFaqCallbackSent, setIsFaqCallbackSent] = useState(false);
  
  // Состояния для Yandex SmartCaptcha
  const [calculatorCaptchaToken, setCalculatorCaptchaToken] = useState(null);
  const [promoCaptchaToken, setPromoCaptchaToken] = useState(null);
  const [appointmentCaptchaToken, setAppointmentCaptchaToken] = useState(null);
  const [ctaCaptchaToken, setCtaCaptchaToken] = useState(null);
  const [faqCallbackCaptchaToken, setFaqCallbackCaptchaToken] = useState(null);
  


  // Функция для инициализации фиксированных цен проектов
  const initProjectPrices = () => {
    const projectIds = [47, 34, 76, 69, 84, 20];
    const prices = {};
    
    // Используем фиксированные цены
    projectIds.forEach(id => {
      prices[id] = getProjectFallbackPrice(id);
    });
    
    setProjectPrices(prices);
  };

  // Фиксированные цены проектов
  const getProjectFallbackPrice = (id) => {
    const fallbackPrices = {
      47: "3 650 000 ₽", // проект 47 Уют 71 плюс
      34: "4 420 000 ₽", // проект 34 Барн 112 
      76: "3 260 000 ₽", // РУБИН
      69: "5 780 000 ₽", // МОНТАНА
      84: "цена по запросу", // ЗЕНИТ-85
      20: "7 980 000 ₽"  // проект 20 Авиньон - 4
    };
    return fallbackPrices[id] || "цена по запросу";
  };

  // Управление скроллом при показе popup
  useEffect(() => {
    if (showPromoPopup) {
      // Отключаем скролл
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Предотвращаем сдвиг контента
    } else {
      // Включаем скролл обратно
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Очищаем стили при размонтировании компонента
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showPromoPopup]);

  // Отслеживаем изменения цены для синхронизации анимации в Header и мобильной панели
  useEffect(() => {
    const currentPrice = totalWithPromoRef.current;
    if (currentPrice && currentPrice !== totalWithPromoStr) {
      setTotalWithPromoStr(currentPrice);
      
      // Запускаем анимацию в Header и мобильной панели
      setPriceAnimated(true);
      const timer = setTimeout(() => {
        setPriceAnimated(false);
      }, 600);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWithPromoStr]); // Убираем totalWithPromoRef.current из зависимостей

  // Показывать попап при попытке ухода (exit intent + mobile back button)
  useEffect(() => {
    // Проверяем устройство и соответствующую настройку
    const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
    
    if (isDesktop && !PROMO.exitPopupEnabled) return;
    if (!isDesktop && !PROMO.exitPopupMobileEnabled) return;
    
    function handleExitIntent(e) {
      // Desktop: показываем попап только если мышь ушла за верхнюю границу окна
      if (e.type === 'mouseout' && e.relatedTarget == null && e.clientY <= 0) {
        setShowPromoPopup(true);
      }
      // Desktop: если окно потеряло focus (blur), показываем только если мышь в верхней части экрана
      if (e.type === 'blur' && window.screenY === 0) {
        setShowPromoPopup(true);
      }
    }

    function handleBeforeUnload(e) {
      // Mobile: при попытке покинуть страницу (кнопка "Назад", закрытие вкладки)
      if (!showPromoPopup) {
        setShowPromoPopup(true);
        
        // Предотвращаем немедленный уход со страницы, чтобы показать popup
        e.preventDefault();
        e.returnValue = '';
        
        // Через небольшую задержку убираем предотвращение, чтобы пользователь мог уйти
        setTimeout(() => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }, 100);
      }
    }

    // Desktop события
    window.addEventListener('mouseout', handleExitIntent);
    window.addEventListener('blur', handleExitIntent);
    
    // Mobile события
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('mouseout', handleExitIntent);
      window.removeEventListener('blur', handleExitIntent);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showPromoPopup]);
  
  const [activePack, setActivePack] = useState("standard"); // Делаем "Оптима" (standard) активным по умолчанию
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Полноэкранный просмотр: массив изображений и стартовый индекс
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [orderFormSent, setOrderFormSent] = useState(false);
  
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
  // Смещение шапки вниз на высоту промо-полосы (отключено, так как промо-полосы нет)
  const promoOffset = 0;
  
  // Рассчитываем новую позицию для липких элементов (шапка + промо + небольшой зазор)
  const STICKY_HEADER = 68;
  const stickyTop = promoOffset + STICKY_HEADER + 24; 

  // URL для Яндекс Навигатора (только для мобильных устройств)
  // const navigatorUrl = `yandexnavi://build_route_on_map?lat_to=55.698696&lon_to=37.580050&zoom=16&description=${encodeURIComponent(CONTACTS.address)}`;

  // Инициализация фиксированных цен проектов при монтировании компонента
  useEffect(() => {
    initProjectPrices();
  }, []);

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
    
    // Проверка, что номер телефона введен полностью
    if (!isValidPhone(payload.phone)) {
        alert('Пожалуйста, введите полный номер телефона (+7 (XXX) XXX-XX-XX)');
        return;
    }
    
    // Проверка капчи
    if (!promoCaptchaToken) {
        alert('Пожалуйста, подтвердите, что вы не робот, выполнив проверку капчи.');
        return;
    }

    const data = {
        ...payload,
        lead_type: "Promo Fixation (Grand Line block)",
        promo_percent: PROMO.percent,
        promo_until: PROMO.until,
        captcha_token: promoCaptchaToken,
    };
    const success = await sendDataToApi(data, 'GrandLine_Form');
    if (success) {
        setIsPromoFormSent(true);
        setPromoCaptchaToken(null); // Сброс токена после успешной отправки
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
    
    // Проверка, что номер телефона введен полностью
    if (!isValidPhone(payload.phone)) {
        alert('Пожалуйста, введите полный номер телефона (+7 (XXX) XXX-XX-XX)');
        return;
    }
    
    // Проверка капчи
    if (!appointmentCaptchaToken) {
        alert('Пожалуйста, подтвердите, что вы не робот, выполнив проверку капчи.');
        return;
    }

    const data = {
        ...payload,
        lead_type: "Appointment Request (Company Section)",
        captcha_token: appointmentCaptchaToken,
    };
    const success = await sendDataToApi(data, 'Appointment');
    if (success) {
        setIsAppointmentFormSent(true);
        setAppointmentCaptchaToken(null); // Сброс токена после успешной отправки
    } else {
        console.error("Произошла ошибка при отправке заявки на консультацию.");
    }
  };

  // Отправка формы обратного звонка из FAQ блока
  const handleFaqCallbackSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name || !payload.phone) return;
    
    // Проверка, что номер телефона введен полностью
    if (!isValidPhone(payload.phone)) {
        alert('Пожалуйста, введите полный номер телефона (+7 (XXX) XXX-XX-XX)');
        return;
    }
    
    // Проверка капчи
    if (!faqCallbackCaptchaToken) {
        alert('Пожалуйста, подтвердите, что вы не робот, выполнив проверку капчи.');
        return;
    }

    const data = {
        ...payload,
        lead_type: "FAQ Callback Request",
        captcha_token: faqCallbackCaptchaToken,
    };
    const success = await sendDataToApi(data, 'FAQ_Callback');
    if (success) {
        setIsFaqCallbackSent(true);
        setFaqCallbackCaptchaToken(null); // Сброс токена после успешной отправки
    } else {
        console.error("Произошла ошибка при отправке заявки из FAQ.");
    }
  };

  /* --- КОНЕЦ ОБНОВЛЕННОЙ ЛОГИКИ --- */
  
  return (
    <>
      {/* Header */}
      <Header 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        daysLeft={daysLeft}
        promoOffset={promoOffset}
        totalWithPromo={totalWithPromoStr}
        priceAnimated={priceAnimated}
      />
    

      {/* Catalog Popup (Exit Intent) */}
      {showPromoPopup && (
        <div className="fixed z-[99999] inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            
            {/* Заголовок */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-2xl z-50">
              <button
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-2xl font-bold z-10"
                onClick={() => setShowPromoPopup(false)}
                aria-label="Закрыть каталог"
                style={{lineHeight:1}}
              >×</button>
              
              <div className="pr-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
                      Еще проекты с хорошими ценами
                    </h2>
                    <p className="text-emerald-700 font-semibold">
                      Более 50 проектов на основном сайте компании БАТУРА
                    </p>
                  </div>
                  
                  <a
                    href="https://batura.ru/catalog.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    <span>Каталог проектов</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Сетка проектов */}
            <div className="p-6 relative z-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    id: 47,
                    name: "УЮТ 71 ПЛЮС",
                    area: "Площадь 105 м²",
                    image: "https://batura.ru/uploads/projects/2025-04-680a27beaa71328.png",
                    features: "1.5 этажа, 3 комнаты"
                  },
                  {
                    id: 34,
                    name: "БАРН 112",
                    area: "Площадь 112 м²",
                    image: "https://batura.ru/uploads/projects/2025-06-684294af3b3db68.png",
                    features: "1 этаж, 3 комнаты"
                  },
                  {
                    id: 76,
                    name: "РУБИН",
                    area: "Площадь 123 м²",
                    image: "https://batura.ru/uploads/projects/2025-09-68dc041c3d75540.png",
                    features: "1 этаж, 3 комнаты"
                  },
                  {
                    id: 69,
                    name: "МОНТАНА",
                    area: "Площадь 131 м²",
                    image: "https://batura.ru/uploads/projects/2025-07-6870dbe447c3772.png",
                    features: "1 этаж, 3 комнаты"
                  },
                  {
                    id: 84,
                    name: "ЗЕНИТ-85",
                    area: "Площадь 85 м²",
                    image: "https://batura.ru/uploads/projects/2025-10-68fca2e848f5c77.png",
                    features: "1 этаж, 2 комнаты"
                  },
                  {
                    id: 20,
                    name: "АВИНЬОН - 4",
                    area: "Площадь 206 м²",
                    image: "https://batura.ru/uploads/projects/2024-05-6639d8f1a8cde65.jpeg",
                    features: "2 этажа, 4 комнаты"
                  }
                ].map((project) => (
                  <a
                    key={project.id}
                    href={`https://batura.ru/project/${project.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative z-0"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%236b7280'%3E%D0%A4%D0%BE%D1%82%D0%BE %D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-neutral-900 mb-1 text-sm">
                        {project.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mb-2">
                        {project.features}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-600 font-medium">{project.area}</span>
                        <span className="font-bold text-emerald-700">
                          {projectPrices[project.id] || getProjectFallbackPrice(project.id)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Призыв к действию */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Более 50 проектов с ценами
                </h3>
                <p className="text-neutral-600 mb-4">
                  Посмотрите полный каталог готовых проектов домов с фиксированными ценами
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://batura.ru/catalog.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span>Смотреть все проекты</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <button
                    onClick={() => setShowPromoPopup(false)}
                    className="px-6 py-3 border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-200"
                  >
                    Остаться на этой странице
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

  {/* Fullscreen Hero с фоновым изображением */}
  <div className="min-h-screen bg-neutral-50 w-full max-w-full overflow-x-hidden" style={{ paddingTop: 68 }}>
        <main className="w-full max-w-full overflow-x-hidden">
          {/* Desktop Hero - Fullscreen with overlay text */}
          <section className="hidden md:block relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image Slider */}
            <div className="absolute inset-0 w-full h-full">
              <ImageSlider
                images={HERO_IMAGES}
                small={false}
                onOpen={openModal}
                auto
                interval={6000}
                heroMode={true}
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30"></div>
            </div>

            {/* Desktop Hero Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 flex items-center min-h-[90vh]">
              <div className="grid grid-cols-2 gap-8 items-center w-full">
                {/* Left Column - Text Content */}
                <div className="text-left">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 backdrop-blur-sm text-emerald-700 px-4 py-2 text-sm font-semibold shadow-lg">
                    ⭐ Гарантия 15 лет
                  </span>
                  <h1 className="mt-6 text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-2xl">
                    Построем Ваш дом за <span className="text-white">7 </span>недель!
                  </h1>
                  <p className="mt-6 text-xl md:text-2xl text-white/90 leading-relaxed drop-shadow-lg">
                    По цене от <span className="font-bold text-white bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">{rub(Math.round(PACKS.luxe.basePrice * (1 - PROMO.percent)))}</span>
                  </p>

                     <div className="inline-flex items-center gap-5 bg-red-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-red-700">🎁 Скидка {Math.round(PROMO.percent*100)}%</span>
                        <span className="text-sm font-bold text-red-700">до {PROMO.until}</span>
                      </div>

                  {/* Features Pills - Compact inline blocks */}
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium">
                      Площадь 71 м² • Терраса 15 м²
                    </div>
                    <br />
                    <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium">
                      Две спальни • Кухня-гостиная
                    </div>
                  </div>
                  {/* CTA Button */}
                  <div className="mt-8">
                    <button
                      onClick={() => scrollToCTA()}
                      className="px-8 py-4 rounded-2xl border-2 border-white/60 font-bold text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/80 transition-all duration-300 text-lg flex items-center gap-2 justify-center shadow-xl"
                      aria-label="Получить бесплатную консультацию от менеджера"
                    >
                      <span>Бесплатная консультация</span>
                    </button>
                  </div>
                </div>

                {/* Right Column - Empty on mobile, can be used for additional content on desktop */}
                <div className="hidden md:block">
                  {/* This space can be used for additional elements or kept empty for image focus */}
                </div>
              </div>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* Mobile Hero - Static image instead of slider */}
          <section className="md:hidden relative overflow-hidden w-full min-h-screen">
            {/* Background Static Image */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={generalPartner_vertical} 
                alt="Каркасный дом Уют-71.ФИКС" 
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Overlay gradients for text readability */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Mobile Hero Content */}
            <div className="relative z-10 h-full flex flex-col w-full max-w-full">
              {/* Top Section - Немного опущено */}
              <div className="px-4 pt-12 pb-6 w-full max-w-full">
                <div className="text-center space-y-4 w-full max-w-full">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/95 backdrop-blur-sm text-emerald-700 px-4 py-2 text-sm font-semibold shadow-lg">
                    ⭐ Гарантия 15 лет
                  </span>
                  
                  <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow-2xl px-2">
                    Построем Ваш дом<span className="text-white"> за 7 </span>недель!
                  </h1>
                  
                  <p className="text-base sm:text-lg text-white/95 leading-relaxed drop-shadow-lg">
                    По цене от <span className="font-bold text-white bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">{rub(Math.round(PACKS.luxe.basePrice * (1 - PROMO.percent)))}</span>
                  </p>
                  
                  {/* Напоминание о времени акции для мобильных */}
                  {PROMO.enabled && daysLeft > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/95 backdrop-blur-sm text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                      СКИДКА еще {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}!
                    </div>
                  )}
                </div>
              </div>

              {/* Spacer - Большое пустое место для дома */}
              <div className="flex-1 min-h-[40vh]"></div>

              {/* Bottom Section - Все элементы в самом низу */}
              <div className="px-4 pb-4 space-y-3 w-full max-w-full">
                {/* Features Pills */}
                <div className="flex flex-wrap justify-center gap-2 w-full max-w-full overflow-hidden">
                  <div className="px-3 py-2 rounded-full bg-white/25 backdrop-blur-sm text-white border border-white/50 font-medium text-sm whitespace-nowrap">
                    Площадь 71 м² • Терраса 15 м²
                  </div>
                  <div className="px-3 py-2 rounded-full bg-white/25 backdrop-blur-sm text-white border border-white/50 font-medium text-sm whitespace-nowrap">
                    Две спальни • Кухня-гостиная
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="text-center px-2 w-full max-w-full">
                  <button
                    onClick={() => scrollToCTA()}
                    className="w-full max-w-xs mx-auto px-4 py-4 rounded-2xl border-2 border-white/90 font-bold text-white bg-white/25 backdrop-blur-sm hover:bg-white/35 hover:border-white transition-all duration-300 text-sm shadow-xl"
                    aria-label="Получить бесплатную консультацию от менеджера"
                  >
                    Бесплатная консультация
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Преимущества: Выносим ключевые УТП */}
          <section className="mx-auto max-w-7xl px-4 pt-16 pb-10">
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
                      <p className="text-3xl font-extrabold text-emerald-600">100 %</p>
                      <p className="text-sm font-semibold text-neutral-700">Фиксированная цена без скрытых доплат</p>
                  </div>
                                 <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md hover:scale-[1.01] transition duration-200">
                      <p className="text-3xl font-extrabold text-emerald-600">{'>'}300 домов</p>
                      <p className="text-sm font-semibold text-neutral-700">С 2016 года строим высококачественные дома</p>
                  </div>
              </div>
          </section>

          {/* Переносим галерею выше для усиления эмоций до расчета */}
          <Gallery openModal={openModal} />

          <FloorPlans openModal={openModal} />
          <Packs 
            activePack={activePack} 
            setActivePack={setActivePack} 
            openModal={openModal} 
            daysLeft={daysLeft}
            onOrderClick={(pack) => {
              setSelectedPack(pack);
              setOrderModalOpen(true);
              setOrderFormSent(false);
            }} 
          />
          <Calculator 
            activePack={activePack} 
            setActivePack={setActivePack} 
            totalWithPromoRef={totalWithPromoRef}
            priceAnimated={priceAnimated} 
            setPriceAnimated={setPriceAnimated}
            calculatorCaptchaToken={calculatorCaptchaToken}
            setCalculatorCaptchaToken={setCalculatorCaptchaToken}
            daysLeft={daysLeft}
          />
        {/* Отзывы и FAQ сразу после калькулятора для снятия возражений */}
        <YandexReviewsWidget 
          isFaqCallbackSent={isFaqCallbackSent}
          setIsFaqCallbackSent={setIsFaqCallbackSent}
          handleFaqCallbackSubmit={handleFaqCallbackSubmit}
          setFaqCallbackCaptchaToken={setFaqCallbackCaptchaToken}
        />

        {/* Наши партнеры: Проверенные материалы */}
        <section id="partners" className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Строим только из проверенных материалов</h2>
          
          {/* Генеральный партнер Grand Line */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              {/* Изображение */}
              <div className="w-full h-full">
                <ProtectedImage 
                  src={generalPartner1} 
                  alt="Логотип Grand Line — генеральный партнер и поставщик материалов" 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>

              {/* Контент с формой */}
              <div className="p-6 space-y-4">
                <div className="inline-flex items-center gap-6 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  <span>🎁 Скидка {Math.round(PROMO.percent*100)}%</span>
                  <span>Только до {PROMO.until}</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-red-700">
                  Grand_Line — генеральный партнер акции
                </h3>
                
                <p className="text-gray-700 text-sm">
                  Прямые поставки с завода Grand_Line. Вы получаете материалы по ценам производителя с гарантией качества.
                </p>

                {/* Форма */}
                {isPromoFormSent ? (
                  <SuccessMessage
                    title="✅ Ваша скидка зафиксирована!"
                    subtitle="Ждите звонка нашего менеджера."
                    onReset={() => setIsPromoFormSent(false)}
                  />
                ) : (
                  <form className="space-y-3" onSubmit={handlePromoFormSubmit}>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ваше имя"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <InputMask
                      mask="+7 (999) 999-99-99"
                      name="phone"
                      required
                      placeholder="+7 (XXX) XXX-XX-XX"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      inputMode="tel"
                    />
                    
                    <p className="text-xs text-gray-600">
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
                    </p>
                    
                    <div className="flex justify-center">
                      <SmartCaptcha 
                        onSuccess={(token) => setPromoCaptchaToken(token)} 
                        onError={(error) => console.error('Captcha error:', error)}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full px-4 py-3 font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all"
                    >
                      ХОЧУ СКИДКУ
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Другие поставщики */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                Наши поставщики
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                
                {/* Окна REHAU */}
                <div className="group text-center p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                    <img 
                      src={rehauLogoUrl} 
                      alt="Логотип Rehau — профили для окон" 
                      className="h-16 w-auto" 
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Окна REHAU</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Немецкий профиль премиум-класса. Энергоэффективность и долговечность без регулировки годами.
                  </p>
                </div>
                
                {/* Утеплитель KNAUF */}
                <div className="group text-center p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                    <img 
                      src={knaufLogoUrl} 
                      alt="Логотип Knauf — теплоизоляция" 
                      className="h-16 w-auto" 
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Утеплитель KNAUF</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Экологически чистая теплоизоляция. Негорючая и безопасная для жилых домов.
                  </p>
                </div>
                
                {/* Изоляция ТЕХНОНИКОЛЬ */}
                <div className="group text-center p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                    <img 
                      src={technonicolLogoUrl} 
                      alt="Логотип Технониколь — изоляционные материалы" 
                      className="h-16 w-auto" 
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Изоляция ТЕХНОНИКОЛЬ</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Базальтовый утеплитель и защитные пленки. Максимальная защита от влаги и конденсата.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


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

          {/* Process Section (ВРЕМЕННО ОТКЛЮЧЕН ДЛЯ ТЕСТИРОВАНИЯ) */}
          {/*
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
          */}

          {/* Geography Section */}
          <section id="geography" className="mx-auto max-w-7xl px-4 py-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Мы работаем для вас в радиусе 200 км от Москвы</h2>
            <div className="grid md:grid-cols-2 gap-6 items-center bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Левая колонка: текстовая информация */}
              <div className="p-8 md:p-12">
                <p className="text-lg text-emerald-700 font-semibold mb-4">Личный контроль качества на каждом объекте</p>
                <p className="text-neutral-700 text-base leading-relaxed">Ваш дом всегда под нашим контролем. Мы работаем только в радиусе 200 км от МКАД, чтобы обеспечить личный, оперативный контроль за объектами. Поэтому можем гарантировать качество, соблюдение технологии и сдачу дома в срок.</p>
              </div>

              {/* Правая колонка: карта */}
              <div className="w-full h-full min-h-[300px]">
                <ProtectedImage 
                  src={geoMapUrl} 
                  alt="География строительства компании «Батура»" 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                />
              </div>
            </div>
          </section>
          
          {/* Company Section (ФИНАЛЬНОЕ ОБНОВЛЕНИЕ) */}
          <section id="company" className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              {/* Левая колонка: О компании и Фото */}
              <div itemScope itemType="http://schema.org/AboutPage" className="space-y-6">
                <h2 className="text-3xl font-extrabold mb-2 text-neutral-900">О строительной компании «БАТУРА»</h2>
                <p className="text-lg text-emerald-700 font-semibold mb-4">
                  С 2016 года строим надежные каркасные дома — честно, в срок, по фиксированной цене.
                </p>
                <ul className="mt-3 text-base text-neutral-700 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Постоянные бригады и независимый технадзор</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Собственное производство в г.Шарья с 2019 года</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Гарантия от 15 лет по договору</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Аккредитация в СберБанке, ВТБ, ДомРФ и др.</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Построено более 300 домов</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Собственный проектный отдел с 2012 года</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Партнерские отношения с ведущими производителями</li>
                  <li className="flex items-start gap-2"><span className="text-xl text-emerald-600">✓</span> Новый офис продаж в Москве с 2023 года</li>
                                  </ul>
                {/* Фотография шоурума */}
                <div className="w-full overflow-hidden rounded-2xl shadow-xl">
                  <ProtectedImage 
                    src={officeBaturaUrl} // ИСПОЛЬЗУЕМ ИМПОРТ
                    alt="Уютный, современный шоурум компании «Батура» в Москве" 
                    className="w-full h-auto object-cover border border-neutral-200" 
                    loading="lazy" 
                  />
                </div>
              </div>
                          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl space-y-6 sticky top-24 h-fit" itemScope itemType="http://schema.org/LocalBusiness">
                <h3 className="font-extrabold text-xl mb-3 text-center text-neutral-900">Пользуйтесь бесплатной офисной парковкой</h3>
                <meta itemProp="name" content="Батура. Строительство каркасных домов" />
                
                <div className="flex flex-col gap-4">
                                        <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="flex flex-col items-center">
                                                    <img
                            src={qrCodeRouteUrl} // ИСПОЛЬЗУЕМ ИМПОРТ
                            alt="QR-код для прокладывания маршрута в шоурум Батура на Яндекс Картах"
                            className="w-36 h-36 object-contain border-4 border-emerald-500 rounded-lg shadow-md"
                            loading="lazy"
                          />
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">ПРОЛОЖИТЬ МАРШРУТ</p>
                      
                      {/* Кнопка для мобильных устройств */}
                      <div className="md:hidden w-full mt-3">
                        <a
                          href={`yandexnavi://build_route_on_map?lat_to=${CONTACTS.coordinates.lat}&lon_to=${CONTACTS.coordinates.lng}`}
                          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Проложить маршрут в Яндекс.Навигаторе"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 13l-6-3" />
                          </svg>
                          Открыть в Навигаторе
                        </a>
                      </div>
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
                                   <span itemProp="addressLocality"></span> <span itemProp="streetAddress">{CONTACTS.address}</span>
                               </span>
                               <span className="block text-sm text-neutral-500">{CONTACTS.address2}</span>
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
                        <InputMask
                              mask="+7 (999) 999-99-99"
                              name="phone"
                              required
                              placeholder="+7 (XXX) XXX-XX-XX"
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-900"
                              inputMode="tel"
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
                        
                        <div className="flex justify-center w-full max-w-full overflow-hidden">
                          <div className="w-full max-w-xs">
                            <SmartCaptcha 
                              onSuccess={(token) => setAppointmentCaptchaToken(token)} 
                              onError={(error) => console.error('Captcha error:', error)}
                            />
                          </div>
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

          <section id="cta" className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-neutral-900">С чего начать? Три простых шага к своему дому:</h2>
                
                {/* Напоминание о времени акции в CTA */}
                {PROMO.enabled && daysLeft > 0 && (
                  <div className="mt-4 mb-4 inline-flex items-center gap-4 rounded-full bg-red-600 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                    ⏰ Скидка {PROMO.percent * 100}% Действует ещё {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}!
                  </div>
                )}
                
                <p className="mt-2 text-neutral-600 font-semibold">
                  Отправьте свои пожелания — перезвоним, подберем комплектацию и зафиксируем цену.
                </p>
                <ol className="mt-4 text-base text-neutral-700 space-y-2 list-decimal list-inside font-semibold">
                  <li>Выберите комплектацию в калькуляторе выше (например, "Хит продаж: ОПТИМА")</li>
                  <li>Получите фикс-смету и подпишите договор</li>
                  <li>Через 7 недель после начала строительства вы въезжаете в свой дом</li>
                </ol>
                <p className="mt-4">
                    <span className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                        <span className="text-base font-semibold text-neutral-700">
                             Если не уложимся в срок, <b className="text-emerald-600">мы компенсируем</b> ваши расходы на аренду жилья. Это прописано в договоре.
                        </span>
                    </span>
                   </p>
              </div>
              <form className="bg-white text-neutral-900 rounded-2xl p-6 space-y-4 shadow-2xl" onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = Object.fromEntries(fd.entries());
                  
                  // Проверка, что номер телефона введен полностью
                  if (!isValidPhone(payload.phone)) {
                      alert('Пожалуйста, введите полный номер телефона (+7 (XXX) XXX-XX-XX)');
                      return;
                  }
                  
                  // Проверка капчи
                  if (!ctaCaptchaToken) {
                      alert('Пожалуйста, подтвердите, что вы не робот, выполнив проверку капчи.');
                      return;
                  }

                  const data = {
                    ...payload,
                    lead_type: "Consultation CTA",
                    captcha_token: ctaCaptchaToken,
                  };
                  
                  const success = await sendDataToApi(data, 'CTA_Block');
                  
                  if (success) {
                    // Используем SuccessMessage (хотя бы консольный вывод) или делаем редирект на #calc
                    // Для CTA блока, где нет isSent state, пока оставим логику:
                    e.target.reset(); // Очистка формы
                    setCtaCaptchaToken(null); // Сброс токена
                    const button = e.target.querySelector('button[type="submit"]');
                    if (button) {
                        button.textContent = "✅ Заявка отправлена!";
                        button.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                        button.classList.add('bg-green-600');
                        setTimeout(() => {
                           button.textContent = "ОТПРАВИТЬ";
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
                <InputMask
                  mask="+7 (999) 999-99-99"
                  name="phone"
                  required
                  placeholder="+7 (XXX) XXX-XX-XX — Телефон"
                  className="w-full px-3 py-3 rounded-xl border-2 border-neutral-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                  inputMode="tel"
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
                
                <div className="flex justify-center w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-xs">
                    <SmartCaptcha 
                      onSuccess={(token) => setCtaCaptchaToken(token)} 
                      onError={(error) => console.error('Captcha error:', error)}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-lg shadow-xl hover:bg-emerald-700 transition"
                >
                  ОТПРАВИТЬ
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
                </p>
              </form>
            </div>
          </section>
        </main>
        
        {/* Отступ для мобильного футера */}
        <div className="h-16 md:hidden"></div>
        
        {/* Виджеты мессенджеров для мобильной версии */}
        <div className="fixed right-4 bottom-20 z-40 md:hidden flex flex-col gap-2">
          {/* Telegram */}
          <a
            href={`https://t.me/${CONTACTS.phoneWhatsapp.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.308.02.475z"/>
            </svg>
          </a>
          
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACTS.phoneWhatsapp.replace(/[^\d]/g, '')}?text=Здравствуйте! Интересует строительство дома «Уют-71.ФИКС».`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Написать в WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.347"/>
            </svg>
          </a>
        </div>

        {/* Футер сайта */}
        <footer className="bg-neutral-900 text-white pt-8 pb-4 relative" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4">
            {/* Основной контент футера */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              {/* Колонка 1: Логотип и описание */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={LOGO_URL}
                    alt="Логотип компании Батура"
                    className="h-12 w-auto"
                  />
                  <span className="font-bold text-base">
                    Каркасный дом «Уют-71.ФИКС» от компании «Батура»
                  </span>
                </div>
                <p className="text-neutral-300 mb-3 max-w-md text-sm">
                  Гарантия 15 лет, срок строительства 7 недель, фиксированная цена без доплат.
                </p>
                <p className="text-neutral-300 max-w-md text-sm">
                  Строим надежные каркасные дома с 2016 года. Более 350 реализованных проектов. Собственные производство и бригады.
                </p>
              </div>

              {/* Колонка 2: Навигация */}
              <div>
                <h3 className="font-bold text-base mb-3 text-emerald-400">Навигация</h3>
                <ul className="space-y-1.5">
                  <li>
                    <a href="#packs" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      Комплектации и цены
                    </a>
                  </li>
                  <li>
                    <a href="#gallery" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      Примеры работ
                    </a>
                  </li>
                  <li>
                    <a href="#plans" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      Планировка дома
                    </a>
                  </li>
                  <li>
                    <a href="#reviews" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      Отзывы клиентов
                    </a>
                  </li>
                  <li>
                    <a href="#map" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      География работ
                    </a>
                  </li>
                  <li>
                    <a href="#geography" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      Радиус работы
                    </a>
                  </li>
                  <li>
                    <a href="#company" className="text-neutral-300 hover:text-white transition-colors text-sm">
                      О компании
                    </a>
                  </li>
                </ul>
              </div>

              {/* Колонка 3: Контакты */}
              <div>
                <h3 className="font-bold text-base mb-3 text-emerald-400">Контакты</h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Телефон:</p>
                    <a
                      href={`tel:${CONTACTS.phoneHref}`}
                      className="text-white text-sm font-semibold hover:text-emerald-400 transition-colors"
                    >
                      {CONTACTS.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Email:</p>
                    <a
                      href={`mailto:${CONTACTS.email}`}
                      className="text-white text-sm hover:text-emerald-400 transition-colors"
                    >
                      {CONTACTS.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Адрес:</p>
                    <p className="text-white text-sm">
                      {CONTACTS.address}
                    </p>
                    
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">График работы:</p>
                    <p className="text-white text-sm">{CONTACTS.hours}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Нижняя часть футера */}
            <div className="border-t border-neutral-700 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="text-neutral-400 text-xs">
                  © 2025 Строительная компания «Батура». Все права защищены.
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    Политика конфиденциальности
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    Пользовательское соглашение
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
      {/* Полноэкранная галерея (десктоп) */}
      {modalImages.length > 0 && (
        <Modal images={modalImages} startIndex={modalIndex} onClose={closeModal} />
      )}
      
      {/* Модальное окно заказа дома */}
      <OrderModal 
        isOpen={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setSelectedPack(null);
          setOrderFormSent(false);
        }}
        pack={selectedPack}
        onSubmit={() => setOrderFormSent(true)}
        isSubmitted={orderFormSent}
        daysLeft={daysLeft}
      />
    </>
  );
}

export default UyutLanding;
