# Миграция базы данных для календаря расходов

## Статус: ✅ ВЫПОЛНЕНО

Таблица `calendar_events` и enum `recurrence_type` успешно созданы в базе данных.

## Что было создано:

### 1. Enum `recurrence_type`
```sql
CREATE TYPE "recurrence_type" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');
```

### 2. Таблица `calendar_events`
```sql
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "event_date" DATE NOT NULL,
    "recurrence" "recurrence_type",
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);
```

### 3. Индексы
```sql
CREATE INDEX "idx_calendar_events_user_date" ON "calendar_events"("user_id", "event_date");
CREATE INDEX "idx_calendar_events_user_completed" ON "calendar_events"("user_id", "is_completed");
```

### 4. Внешние ключи
```sql
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_category_id_fkey" 
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON UPDATE NO ACTION;
```

## Структура таблицы:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `user_id` | UUID | Ссылка на пользователя |
| `category_id` | UUID | Ссылка на категорию |
| `title` | TEXT | Название события |
| `description` | TEXT | Описание (опционально) |
| `amount` | DECIMAL(14,2) | Сумма события |
| `event_date` | DATE | Дата события |
| `recurrence` | recurrence_type | Тип повторения |
| `is_completed` | BOOLEAN | Статус выполнения |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

## Связи:

- **users** → **calendar_events** (1:много) - каскадное удаление
- **categories** → **calendar_events** (1:много) - без каскадного удаления

## Индексы для производительности:

1. `idx_calendar_events_user_date` - для быстрого поиска событий пользователя по дате
2. `idx_calendar_events_user_completed` - для фильтрации по статусу выполнения

## Проверка:

Для проверки корректности миграции выполните:

```sql
-- Проверить существование таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'calendar_events';

-- Проверить структуру таблицы
\d calendar_events;

-- Проверить enum
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'recurrence_type');
```

## Готово к использованию! 🎉

Таблица создана и готова для работы с календарем расходов.
