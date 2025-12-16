// Код для консоли браузера - генерация истории за предыдущую неделю
// Скопируйте и вставьте этот код в консоль браузера (F12)

(function() {
  const MEALS_KEY = 'bju_meals';
  
  // Функция для форматирования даты в формат YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Функция для генерации ID
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Функция для генерации случайного времени приема пищи
  function generateMealTime(dayIndex, mealIndex, totalMeals) {
    // Распределяем приемы пищи в течение дня
    // Завтрак: 7-9, Обед: 12-14, Ужин: 18-20, Перекусы: между основными
    const baseHour = 7 + (mealIndex / totalMeals) * 13;
    const hour = Math.floor(baseHour);
    const minute = Math.floor((baseHour - hour) * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  
  // Функция для генерации случайных значений БЖУ
  function generateMacros() {
    // Генерируем реалистичные значения
    const proteins = Math.round((Math.random() * 30 + 10) * 2) / 2; // 10-40 г
    const fats = Math.round((Math.random() * 20 + 5) * 2) / 2; // 5-25 г
    const carbs = Math.round((Math.random() * 50 + 15) * 2) / 2; // 15-65 г
    return { proteins, fats, carbs };
  }
  
  // Получаем существующие данные или создаем новый объект
  const existingData = localStorage.getItem(MEALS_KEY);
  const allMeals = existingData ? JSON.parse(existingData) : {};
  
  // Генерируем данные за предыдущую неделю (7 дней)
  const today = new Date();
  
  for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = formatDate(date);
    
    // Генерируем от 3 до 5 приемов пищи в день
    const mealsCount = Math.floor(Math.random() * 3) + 3; // 3-5 приемов
    const meals = [];
    
    for (let i = 0; i < mealsCount; i++) {
      const macros = generateMacros();
      meals.push({
        id: generateId(),
        time: generateMealTime(dayOffset, i, mealsCount),
        proteins: macros.proteins,
        fats: macros.fats,
        carbs: macros.carbs
      });
    }
    
    // Сортируем приемы пищи по времени
    meals.sort((a, b) => a.time.localeCompare(b.time));
    
    // Если для этой даты уже есть данные, добавляем к ним (или заменяем - раскомментируйте следующую строку)
    // allMeals[dateStr] = meals;
    
    // Или объединяем с существующими (по умолчанию)
    if (allMeals[dateStr]) {
      allMeals[dateStr] = [...allMeals[dateStr], ...meals];
      // Сортируем по времени после объединения
      allMeals[dateStr].sort((a, b) => a.time.localeCompare(b.time));
    } else {
      allMeals[dateStr] = meals;
    }
  }
  
  // Сохраняем в localStorage
  localStorage.setItem(MEALS_KEY, JSON.stringify(allMeals));
  
  console.log('✅ История за предыдущую неделю успешно создана!');
  console.log('📊 Сгенерировано дней:', Object.keys(allMeals).length);
  console.log('🍽️ Всего приемов пищи:', Object.values(allMeals).reduce((sum, meals) => sum + meals.length, 0));
  console.log('📅 Даты:', Object.keys(allMeals).sort().join(', '));
  
  return allMeals;
})();

