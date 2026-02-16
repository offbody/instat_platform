# Инстат MVP | Платформа управления СОКБ

Интеллектуальная панель управления показателями СОКБ (Стандарт Общественного Капитала Бизнеса) с аналитикой на базе ИИ.

## Стек технологий

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Сборка**: Vite
*   **Графики**: Recharts
*   **AI**: Google Gemini API (@google/genai)
*   **Карты**: Yandex Maps API

## Установка и запуск

1.  Клонируйте репозиторий:
    ```bash
    git clone https://github.com/your-username/instat-mvp.git
    cd instat-mvp
    ```

2.  Установите зависимости:
    ```bash
    npm install
    # или
    yarn install
    ```

3.  Создайте файл `.env` в корне проекта и добавьте ваш ключ API (для локальной разработки):
    ```env
    API_KEY=your_google_gemini_api_key
    ```

4.  Запустите режим разработки:
    ```bash
    npm run dev
    ```

## Деплой на Vercel

Проект полностью готов к деплою на Vercel.

1.  Загрузите проект на GitHub.
2.  Импортируйте репозиторий в Vercel.
3.  В настройках проекта на Vercel добавьте Environment Variable:
    *   **Name**: `API_KEY`
    *   **Value**: *Ваш ключ Google Gemini API*
4.  Нажмите **Deploy**.

## Структура проекта

*   `/src` - (Корневая директория в данном MVP)
    *   `components/` - UI компоненты (Sidebar, StatCard, Charts)
    *   `services/` - Логика работы с API (Gemini)
    *   `types.ts` - TypeScript интерфейсы
    *   `constants.tsx` - Начальные данные
    *   `App.tsx` - Основной компонент приложения
