/* === PROMO: единая настройка акции для всего сайта) === */
const PROMO = {
  enabled: true,                            // вкл/выкл акцию true/false
  percent: 0.16,                            // размер скидки (например, 0.07 для 7%)
  until: "10 ноября",                      // срок действия акции (текст)
  endDate: { year: 2025, month: 11, day: 10 }, // дата завершения акции (месяц: 1-12)
  exitPopupEnabled: true,                   // вкл/выкл Popup для desktop true/false
  exitPopupMobileEnabled: true,            // вкл/выкл Popup для mobile true/false
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
PROMO.bannerText = `По цене от ${PROMO.until}!`;

export { PROMO }; 
