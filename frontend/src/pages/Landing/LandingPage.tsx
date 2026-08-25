import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChartNoAxesCombined,
  ClipboardCheck,
  CreditCard,
  Bell,
  GraduationCap,
  ShieldCheck,
  Users,
  ArrowRight,
  Check,
  Layers,
  LineChart,
  FolderTree,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const modules = [
  {
    icon: BookOpen,
    title: 'Курсы и контент',
    points: [
      'Каталог курсов с категориями, уровнем и ценой',
      'Модули, уроки (текст, видео, PDF, ссылки)',
      'Публикация / черновик / архив',
      'Прогресс прохождения по урокам',
    ],
  },
  {
    icon: Users,
    title: 'Пользователи и роли',
    points: [
      'Админ, преподаватель, студент',
      'Профили, статусы, блокировка',
      'Запись на курсы и контроль доступа',
      'Раздельные кабинеты под каждую роль',
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Задания',
    points: [
      'Создание заданий к курсам',
      'Сдача ответов студентами',
      'Проверка и оценка преподавателем',
      'Дедлайны и статусы работ',
    ],
  },
  {
    icon: CreditCard,
    title: 'Оплаты',
    points: [
      'Mock-checkout как у реальных платежей',
      'Оплата открывает доступ к курсу',
      'История транзакций у студента и админа',
      'Учёт выручки в аналитике',
    ],
  },
  {
    icon: LineChart,
    title: 'Аналитика',
    points: [
      'Дашборд: студенты, курсы, доход',
      'Графики регистраций и продаж',
      'Популярные курсы и активность',
      'Отчёты для админа и преподавателя',
    ],
  },
  {
    icon: Bell,
    title: 'Уведомления',
    points: [
      'Новые записи на курс',
      'Успешная оплата',
      'Проверка заданий',
      'Завершение курса',
    ],
  },
];

const studentPath = [
  { title: 'Регистрация', text: 'Создаёте аккаунт студента и входите в личный кабинет.' },
  { title: 'Выбор курса', text: 'Смотрите каталог, описание, программу и стоимость.' },
  { title: 'Оплата', text: 'Оплачиваете курс через безопасный mock-checkout (демо).' },
  { title: 'Обучение', text: 'Проходите уроки, сдаёте задания, следите за прогрессом.' },
];

const teacherPath = [
  { title: 'Создание курса', text: 'Заполняете программу, цену, уровень и обложку.' },
  { title: 'Контент', text: 'Добавляете модули, уроки и учебные материалы.' },
  { title: 'Задания', text: 'Публикуете задания и проверяете работы студентов.' },
  { title: 'Контроль', text: 'Видите активность группы и результаты обучения.' },
];

const faqs = [
  {
    q: 'Что такое EduCRM?',
    a: 'Это образовательная CRM-платформа Кыргызской фондовой биржи: управление курсами, студентами, преподавателями, заданиями, оплатами и аналитикой в одной системе.',
  },
  {
    q: 'Кому подходит платформа?',
    a: 'Студентам — для обучения и покупки курсов; преподавателям — для ведения программ и проверки работ; администраторам — для полного управления платформой.',
  },
  {
    q: 'Оплата настоящая?',
    a: 'Нет. Встроен mock-платёжный шлюз для демонстрации: оплата картой или QR-кодом. Деньги не списываются. Тестовая карта успеха: 4242 4242 4242 4242.',
  },
  {
    q: 'Как начать работу?',
    a: 'Нажмите «Регистрация», создайте аккаунт студента или преподавателя и войдите в кабинет. Администратор назначается отдельно при развёртывании системы.',
  },
  {
    q: 'Какие данные хранит система?',
    a: 'Профили пользователей, курсы и прогресс, задания и оценки, платежи (mock), уведомления и агрегированную аналитику.',
  },
];

const outcomes = [
  {
    title: 'Прозрачный учебный процесс',
    text: 'Видно, кто записан, на каком уроке студент, какие задания сданы и где есть отставание.',
  },
  {
    title: 'Меньше ручной рутины',
    text: 'Курсы, записи, проверки и оплаты ведутся в одном кабинете — без таблиц и переписок «вразнобой».',
  },
  {
    title: 'Контроль доступа к контенту',
    text: 'Платный курс открывается после оплаты, бесплатный — по записи. Роли ограничивают разделы системы.',
  },
  {
    title: 'Понятная картина для руководства',
    text: 'Дашборд показывает активность, популярные курсы и выручку — решения опираются на данные.',
  },
];

export function LandingPage() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo variant="dark" />
          <div className="flex items-center gap-2">
            <a
              href="/education"
              className="hidden text-sm font-medium text-white/80 hover:text-white sm:inline"
            >
              ← Сайт КФБ
            </a>
            {token ? (
              <Link to="/dashboard">
                <Button className="!bg-white !text-ink hover:!bg-brand-50">В кабинет</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="!text-white hover:!bg-white/10 hover:!text-white">
                    Войти
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-flex">
                  <Button className="!bg-white !text-ink hover:!bg-brand-50">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 sm:items-center sm:pb-24 sm:pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a1d]/92 via-[#152428]/78 to-[#2d6875]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a1d]/70 via-transparent to-[#0f1a1d]/35" />

        <div className="landing-hero-copy relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Edu<span className="text-brand-300">CRM</span>
          </p>
          <h1 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-snug tracking-tight text-white/95 sm:text-3xl">
            Образовательная платформа Кыргызской фондовой биржи
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            Единая система для запуска курсов, обучения студентов, проверки заданий, приёма оплаты и аналитики.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {token ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-brand-400 text-white hover:bg-brand-500">
                  Перейти в кабинет
                  <ArrowRight size={18} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-brand-400 text-white hover:bg-brand-500">
                    Начать бесплатно
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="!border-white/25 !bg-white/10 !text-white backdrop-blur hover:!bg-white/20"
                  >
                    Войти
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* What / why */}
      <section className="landing-section mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">О платформе</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Зачем нужна EduCRM
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <p className="text-lg leading-relaxed text-kse-muted">
            Вместо разрозненных таблиц, мессенджеров и отдельных сервисов оплаты EduCRM собирает учебный процесс
            в одном кабинете: от публикации курса до отчёта по прогрессу и выручке.
          </p>
          <ul className="space-y-3 text-[15px] text-ink">
            {[
              'Централизованный каталог курсов и программ',
              'Роли с разными правами доступа',
              'Прогресс обучения и проверка заданий',
              'Mock-оплата курсов и учёт платежей',
              'Дашборд и аналитика для руководства',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modules inventory */}
      <section className="border-y border-kse-border bg-panel py-20 sm:py-24 dark:border-border-dark dark:bg-panel-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Модули системы</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Что умеет платформа
              </h2>
            </div>
            <Layers className="hidden h-8 w-8 text-brand-400 sm:block" />
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div key={m.title}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    <m.icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-bold tracking-tight">{m.title}</h3>
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-kse-muted">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Сценарии</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Как проходит работа
        </h2>
        <div className="mt-12 grid gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center gap-2 text-brand-600">
              <GraduationCap size={20} />
              <h3 className="font-display text-xl font-bold text-ink">Путь студента</h3>
            </div>
            <ol className="space-y-5">
              {studentPath.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <div className="font-mono text-sm font-bold text-brand-500">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <p className="mt-1 text-sm text-kse-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="mb-6 flex items-center gap-2 text-brand-600">
              <BookOpen size={20} />
              <h3 className="font-display text-xl font-bold text-ink">Путь преподавателя</h3>
            </div>
            <ol className="space-y-5">
              {teacherPath.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <div className="font-mono text-sm font-bold text-brand-500">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <p className="mt-1 text-sm text-kse-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Roles detail */}
      <section className="border-y border-kse-border bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-100">Доступы</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Три роли — три кабинета</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div>
              <ShieldCheck className="mb-3 text-brand-200" size={22} />
              <h3 className="font-display text-xl font-bold">Администратор</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Пользователи, преподаватели, категории, все курсы, оплаты, аналитика и настройки системы.
              </p>
            </div>
            <div>
              <BookOpen className="mb-3 text-brand-200" size={22} />
              <h3 className="font-display text-xl font-bold">Преподаватель</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Свои курсы, модули и уроки, задания, проверка работ, студенты курса и базовая аналитика.
              </p>
            </div>
            <div>
              <GraduationCap className="mb-3 text-brand-200" size={22} />
              <h3 className="font-display text-xl font-bold">Студент</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Каталог, покупка/запись, обучение, сдача заданий, прогресс, история оплат и уведомления.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Эффект</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Что меняется после внедрения
        </h2>
        <p className="mt-4 max-w-2xl text-kse-muted">
          EduCRM закрывает типовые разрывы между обучением, учётом студентов и контролем оплат.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {outcomes.map((item, i) => (
            <div key={item.title} className="border-l-2 border-brand-400 pl-5">
              <div className="font-mono text-xs font-semibold text-brand-500">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-kse-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Also includes */}
      <section className="border-t border-kse-border bg-kse-surface/60 py-16 dark:border-border-dark dark:bg-panel-dark/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">Также в системе</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FolderTree, t: 'Категории курсов', d: 'Структура каталога и тематики программ' },
              { icon: ChartNoAxesCombined, t: 'Отчёты', d: 'Регистрации, продажи, популярные курсы' },
              { icon: ShieldCheck, t: 'Права доступа', d: 'Разграничение разделов по ролям' },
              { icon: Bell, t: 'Лента событий', d: 'Уведомления о ключевых действиях' },
            ].map((item) => (
              <div key={item.t}>
                <item.icon size={20} className="text-brand-500" />
                <div className="mt-3 font-semibold">{item.t}</div>
                <p className="mt-1 text-sm text-kse-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">FAQ</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Частые вопросы</h2>
        <div className="mt-10 divide-y divide-kse-border dark:divide-border-dark">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-semibold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-brand-500 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-kse-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#152428] px-6 py-14 sm:px-12">
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Готовы посмотреть EduCRM изнутри?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Создайте аккаунт студента или преподавателя — кабинет откроется сразу после регистрации.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {token ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-brand-400 hover:bg-brand-500">
                    Перейти в кабинет
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-brand-400 hover:bg-brand-500">
                      Создать аккаунт
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="secondary" className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10">
                      Войти
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-kse-border py-8 dark:border-border-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <BrandLogo />
          <p className="text-sm text-kse-muted">© {new Date().getFullYear()} EduCRM · Кыргызская фондовая биржа</p>
        </div>
      </footer>
    </div>
  );
}
