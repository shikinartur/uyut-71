/* === PROMO: единая настройка акции для всего сайта) === */
const PROMO = {
  enabled: true,                            // вкл/выкл акцию true/false
  percent: 0.07,                            // размер скидки (например, 0.07 для 7%)
  until: "15 октября",                      // срок действия акции (текст)
  endDate: { year: 2025, month: 10, day: 15 }, // дата завершения акции (месяц: 1-12)
  exitPopupEnabled: false,                   // срок вкл/выкл Popup true/false
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

export { PROMO }; 
