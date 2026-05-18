# FlowForge

**FlowForge** — вебзастосунок для керування завданнями, проєктами та командною роботою в межах робочих просторів (workspaces). Інтерфейс українською мовою.

## Можливості

- Реєстрація та вхід (email / пароль, OAuth через Appwrite)
- Робочі простори з запрошеннями за кодом
- Ролі учасників: адміністратор і учасник
- Проєкти, спринти, теги
- Завдання: список, Kanban, календар; фільтри за статусом, виконавцем, проєктом, терміном, тегами
- Коментарі до завдань
- Аналітика workspace (діаграми, таймлайн)

## Стек технологій

| Шар         | Технології                                                    |
| ----------- | ------------------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| UI          | shadcn/ui, Radix UI, Recharts, TipTap                         |
| Стан / дані | TanStack Query, nuqs, React Hook Form, Zod                    |
| Backend     | Hono (API routes у Next.js), Appwrite (BaaS)                  |
| Інше        | @hello-pangea/dnd (Kanban), date-fns                          |

## Вимоги

- **Node.js** 20+
- **npm** (або pnpm / yarn)
- Обліковий запис [Appwrite Cloud](https://cloud.appwrite.io) або власний Appwrite Server
- Колекції та bucket у Appwrite (див. [Сутності](#сутності-appwrite))

## Швидкий старт

### 1. Клонування та залежності

```bash
git clone <url-репозиторію>
cd jira-clone
npm install
```

### 2. Змінні середовища

Створіть файл `.env` у корені проєкту:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=<project-id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<database-id>

NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_TASKS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_TAGS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_SPRINTS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_COMMENTS_ID=<collection-id>
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=<bucket-id>

# Серверний ключ (тільки на backend, не публікувати)
NEXT_APPWRITE_KEY=<api-key-with-databases-and-users-scope>

# URL застосунку (для RPC-клієнта та metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Опційно: OAuth-провайдери в Appwrite Console
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **Важливо:** `NEXT_APPWRITE_KEY` використовується лише на сервері. Не комітьте `.env` у git.

### 3. Appwrite

1. Створіть проєкт і базу даних.
2. Додайте колекції з атрибутами згідно з таблицею [Сутності](#сутності-appwrite).
3. Створіть **Storage bucket** для зображень workspace / project.
4. У **API Keys** створіть ключ з правами на Databases, Users, Storage (за потреби).
5. У **Auth** увімкніть Email/Password; за бажанням — GitHub / Google і redirect URL: `http://localhost:3000/oauth`.

### 4. Запуск

```bash
# Розробка (Turbopack)
npm run dev

# Продакшн
npm run build
npm run start

# Лінтер
npm run lint
```

Відкрийте [http://localhost:3000](http://localhost:3000).

### 5. Демо-дані (опційно)

```bash
npm run seed:tasks          # тестові завдання
npm run seed:tasks:dry      # перегляд без запису

npm run seed:comments
npm run seed:comments:dry

npm run shuffle:assignees   # випадкові виконавці на задачах
npm run shuffle:assignees:dry
```

Скрипти читають `.env` і потребують валідного `NEXT_APPWRITE_KEY`.

---

## Сутності (Appwrite)

Усі сутності зберігаються в одній базі (`DATABASE_ID`). Зв’язки many-to-many реалізовані масивами ID у документі (Appwrite), а не окремою junction-таблицею.

### Workspaces

| Поле         | Тип     | Опис                                   |
| ------------ | ------- | -------------------------------------- |
| `name`       | string  | Назва робочого простору                |
| `userId`     | string  | ID користувача-творця (історичне поле) |
| `imageUrl`   | string? | Аватар (base64 або URL)                |
| `inviteCode` | string  | Код запрошення                         |

### Members

Зв’язок **користувач ↔ workspace** і роль.

| Поле          | Тип    | Опис                         |
| ------------- | ------ | ---------------------------- |
| `userId`      | string | ID користувача Appwrite Auth |
| `workspaceId` | string | FK → Workspaces              |
| `role`        | enum   | `ADMIN` \| `MEMBER`          |

### Projects

| Поле          | Тип     | Опис               |
| ------------- | ------- | ------------------ |
| `name`        | string  | Назва проєкту      |
| `workspaceId` | string  | FK → Workspaces    |
| `imageUrl`    | string? | Зображення проєкту |

### Tasks

| Поле          | Тип       | Опис                                                  |
| ------------- | --------- | ----------------------------------------------------- |
| `name`        | string    | Назва завдання                                        |
| `status`      | enum      | `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE` |
| `workspaceId` | string    | FK → Workspaces                                       |
| `projectId`   | string    | FK → Projects                                         |
| `assigneeIds` | string[]  | ID документів Members                                 |
| `tagIds`      | string[]? | ID документів Tags                                    |
| `sprintId`    | string?   | FK → Sprints                                          |
| `position`    | number    | Порядок у Kanban                                      |
| `dueDate`     | string    | ISO-дата                                              |
| `description` | string    | HTML / rich text                                      |

### Tags

| Поле          | Тип    | Опис            |
| ------------- | ------ | --------------- |
| `name`        | string | Назва тегу      |
| `color`       | string | HEX-колір       |
| `workspaceId` | string | FK → Workspaces |

### Sprints

| Поле          | Тип    | Опис            |
| ------------- | ------ | --------------- |
| `name`        | string | Назва спринту   |
| `workspaceId` | string | FK → Workspaces |
| `projectId`   | string | FK → Projects   |
| `startDate`   | string | Початок         |
| `endDate`     | string | Кінець          |

### Comments

| Поле          | Тип    | Опис                 |
| ------------- | ------ | -------------------- |
| `taskId`      | string | FK → Tasks           |
| `workspaceId` | string | FK → Workspaces      |
| `memberId`    | string | FK → Members (автор) |
| `body`        | string | Текст коментаря      |

### Схема зв’язків (спрощено)

```
User (Appwrite Auth)
  └── Member ──► Workspace
                    ├── Project ──► Task ◄── Tag (через tagIds[])
                    │                  ├── Comment
                    │                  └── Sprint (sprintId)
                    └── Tag
```

---

## Структура проєкту

```
jira-clone/
├── public/                 # Статика (логотип тощо)
├── scripts/                # Seed- та утилітарні скрипти
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # sign-in, sign-up
│   │   ├── (dashboard)/    # основний UI з sidebar
│   │   ├── (standalone)/ # settings, members, create, join
│   │   ├── api/[[...route]]/  # Hono API
│   │   └── oauth/          # OAuth callback
│   ├── components/         # Спільні UI-компоненти
│   ├── features/           # Доменні модулі
│   │   ├── auth/
│   │   ├── workspaces/
│   │   ├── members/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── tags/
│   │   ├── sprints/
│   │   └── comments/
│   ├── lib/                # appwrite, rpc, metadata, utils
│   └── config.ts           # ID колекцій Appwrite
└── package.json
```

Кожен модуль у `features/` зазвичай містить:

- `types.ts` — типи сутності
- `schemas.ts` — Zod-валідація
- `server/` — Hono router
- `api/` — React Query hooks
- `components/` — UI

---

## API (Hono)

Базовий шлях: `/api`

| Префікс           | Призначення                           |
| ----------------- | ------------------------------------- |
| `/api/auth`       | Вхід, реєстрація, поточний користувач |
| `/api/workspaces` | CRUD workspace, join, аналітика       |
| `/api/members`    | Список учасників, ролі, видалення     |
| `/api/projects`   | CRUD проєктів                         |
| `/api/tasks`      | CRUD завдань, bulk update (Kanban)    |
| `/api/tags`       | CRUD тегів                            |
| `/api/sprints`    | CRUD спринтів                         |
| `/api/comments`   | Коментарі до завдань                  |

---

## Маршрути UI

| Шлях                                           | Опис                                   |
| ---------------------------------------------- | -------------------------------------- |
| `/sign-in`, `/sign-up`                         | Авторизація                            |
| `/`                                            | Редірект на перший workspace           |
| `/workspaces/create`                           | Створення workspace                    |
| `/workspaces/:id`                              | Домашня (проєкти)                      |
| `/workspaces/:id/tasks`                        | Завдання (таблиця / Kanban / календар) |
| `/workspaces/:id/tasks/:taskId`                | Картка завдання                        |
| `/workspaces/:id/projects/:projectId`          | Сторінка проєкту                       |
| `/workspaces/:id/analytics`                    | Аналітика                              |
| `/workspaces/:id/settings`                     | Налаштування workspace                 |
| `/workspaces/:id/members`                      | Учасники                               |
| `/workspaces/:id/join/:inviteCode`             | Приєднання за запрошенням              |
| `/workspaces/:id/projects/:projectId/settings` | Налаштування проєкту                   |

---

## Ролі та права

| Дія                                                    | Адміністратор | Учасник  |
| ------------------------------------------------------ | :-----------: | :------: |
| Перегляд workspace, задач, проєктів                    |       ✓       |    ✓     |
| Редагування задач / проєктів                           |       ✓       |    ✓     |
| Створення / видалення задач, проєктів, тегів, спринтів |       ✓       |    ✗     |
| Налаштування workspace, учасники, invite               |       ✓       | обмежено |
| Видалення себе з workspace                             |       ✓       |    ✓     |

Перевірка прав — на сервері (`isWorkspaceAdmin` у API routes).
