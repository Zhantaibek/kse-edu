import { type CSSProperties, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Clock,
  FileText,
  Landmark,
  Mail,
  MessageCircle,
  MonitorPlay,
  Moon,
  Phone,
  Presentation,
  ShieldCheck,
  Sun,
  Users,
  Video,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import './landing.css';

type TrackId = 'investors' | 'participants' | 'professionals';

const tracks: {
  id: TrackId;
  label: string;
  intro: string;
  pieces: { n: number; title: string; text: string; meta: string }[];
  note?: string;
}[] = [
  {
    id: 'investors',
    label: 'Начинающим инвесторам',
    intro: 'Как устроен рынок ценных бумаг Кыргызстана, кто на нём работает и с чего начать частному инвестору.',
    pieces: [
      {
        n: 1,
        title: 'Рынок и его участники',
        text: 'Что такое КФБ, финансовые инструменты, роли брокера, эмитента и инвестора — первые шаги без жаргона.',
        meta: '12 уроков · базовый · видео + квиз',
      },
      {
        n: 2,
        title: 'Как проходит сделка',
        text: 'Торговое приложение, виды заявок, клиринг и расчёты. Разбираем путь ордера на реальных примерах КФБ.',
        meta: '12 уроков · средний · видео + практика',
      },
      {
        n: 3,
        title: 'Портфель и риски',
        text: 'Управление капиталом, психология инвестора и как собрать первый портфель из инструментов кыргызского рынка.',
        meta: '12 уроков · продвинутый · видео + кейсы',
      },
    ],
  },
  {
    id: 'participants',
    label: 'Участникам рынка',
    intro: 'Инфраструктура биржи, инструменты и правила торговли — для сотрудников брокеров, банков и эмитентов.',
    note: 'Расписание очных потоков публикуется в учебном плане на kse.kg. Онлайн-модули открываются в личном кабинете.',
    pieces: [
      { n: 4, title: 'Организация и функционирование рынка ценных бумаг', text: 'Как устроен рынок и кто на нём отвечает.', meta: 'Очный и онлайн' },
      { n: 5, title: 'Инфраструктура и механизмы биржи КФБ', text: 'Торги, клиринг и расчёты на инфраструктуре биржи.', meta: 'Очный и онлайн' },
      { n: 6, title: 'Корпоративные облигации: возможности для бизнеса', text: 'Зачем компании выходит на долговой рынок.', meta: 'Очный и онлайн' },
      { n: 7, title: 'Правила торговли, клиринг и расчёты', text: 'Регламент сделки от заявки до расчёта.', meta: 'Очный и онлайн' },
      { n: 8, title: 'Новые редакции законов КР о рынке ценных бумаг и АО', text: 'Что изменилось в законе и как это читать на практике.', meta: 'Очный и онлайн' },
    ],
  },
  {
    id: 'professionals',
    label: 'Профессиональным специалистам',
    intro: 'Корпоративные треки, подготовка к листингу и отдельные программы для финансистов и эмитентов.',
    note: 'Корпоративный формат согласуется отдельно: группа, даты и программа под задачи компании.',
    pieces: [
      { n: 9, title: 'Стратегическое управление', text: 'Решения, которые компания принимает до выхода на рынок.', meta: 'Корпоративный' },
      { n: 10, title: 'Корпоративное управление и ESG', text: 'Практика совета и раскрытия для эмитента.', meta: 'Корпоративный' },
      { n: 11, title: 'Исламские финансы (сукук)', text: 'Структура сукук и где она стыкуется с рынком КФБ.', meta: 'Корпоративный' },
      { n: 12, title: 'Подготовка к листингу на КФБ', text: 'Что собрать до подачи на листинг.', meta: 'Корпоративный' },
      { n: 13, title: 'Личная эффективность и коммуникации', text: 'Как говорить о сделке и решении внутри компании.', meta: 'Корпоративный' },
    ],
  },
];

const steps = [
  { n: 1, title: 'Видеолекции', text: 'Короткие уроки по 5–12 минут — можно смотреть с телефона.' },
  { n: 2, title: 'Онлайн-курсы в кабинете', text: 'Модули, прогресс, задания и доступ после регистрации.' },
  { n: 3, title: 'Вебинары с экспертами', text: 'Разборы рынка и живые сессии с практиками КФБ.' },
  { n: 4, title: 'Лекции и семинары', text: 'Очные потоки учебного центра — по учебному плану года.' },
  { n: 5, title: 'Материалы и кейсы', text: 'Презентации, PDF и примеры сделок кыргызского рынка.' },
  { n: 6, title: 'Групповые треки', text: 'Корпоративное обучение для команд брокеров и эмитентов.' },
];

const reasons = [
  {
    title: 'Реальные примеры КФБ',
    text: 'Уроки опираются на инструменты, регламенты и практику Кыргызской фондовой биржи, а не на абстрактную теорию.',
  },
  {
    title: 'В своём темпе',
    text: 'Самостоятельное прохождение в кабинете: возвращайтесь к любому модулю, сдавайте задания когда удобно.',
  },
  {
    title: 'Официально от КФБ',
    text: 'Учебный центр работает с 1995 года, с 2001-го — по лицензии на подготовку специалистов рынка ценных бумаг.',
  },
];

const faqs = [
  {
    q: 'С чего начать обучение?',
    a: 'Зарегистрируйтесь на платформе и откройте направление «Начинающим инвесторам». Три курса идут по возрастанию сложности, но опытные участники могут сразу выбрать нужный модуль.',
  },
  {
    q: 'Нужно ли проходить курсы строго по порядку?',
    a: 'Для новичков лучше идти последовательно. Если вы уже работаете на рынке, можно начать с нужного трека — доступ в кабинете не блокирует остальные программы.',
  },
  {
    q: 'Обучение платное?',
    a: 'Часть вводных материалов доступна после регистрации. Стоимость платных курсов указана в каталоге личного кабинета. Вопросы по корпоративным программам — office@kse.kg.',
  },
  {
    q: 'Нужно ли приезжать очно?',
    a: 'Онлайн-курсы проходят в личном кабинете. Отдельные программы учебного центра — очные или смешанные, по учебному плану на год. Даты уточняйте при записи.',
  },
  {
    q: 'Как записаться на очный курс или вебинар?',
    a: 'Анонсы появляются на платформе и на kse.kg. Можно также написать в учебный центр: +996 772 63-79-97 или форму ниже.',
  },
];

const nav = [
  { href: '#courses', label: 'Курсы' },
  { href: '#formats', label: 'Форматы' },
  { href: '#faq', label: 'Вопросы' },
  { href: '#contacts', label: 'Контакты' },
];

const formatIcons = [CirclePlay, MonitorPlay, Video, Presentation, FileText, Users];
const reasonIcons = [Landmark, Clock, ShieldCheck];

// Кольца и шарики — тот же фон, что у баннера на главной КФБ.
const RINGS = [140, 220, 300, 380, 460, 540];
const ORBS = [
  { cx: 1070, cy: 120, r: 46, delay: 0 },
  { cx: 891, cy: 470, r: 30, delay: -4 },
  { cx: 1500, cy: 420, r: 16, delay: -2 },
];

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function HeroScene() {
  return (
    <svg className="kl-scene" viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="kl-orb" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="var(--orb-hi)" />
          <stop offset="1" stopColor="var(--orb-lo)" />
        </radialGradient>
      </defs>
      {RINGS.map((r, i) => (
        <circle key={r} className="kl-ring" cx="1220" cy="380" r={r} strokeDasharray={i === 2 ? '2 10' : undefined} />
      ))}
      {ORBS.map((orb) => (
        <circle
          key={orb.r}
          className="kl-orb"
          cx={orb.cx}
          cy={orb.cy}
          r={orb.r}
          fill="url(#kl-orb)"
          style={{ animationDelay: `${orb.delay}s` }}
        />
      ))}
    </svg>
  );
}

export function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const [trackId, setTrackId] = useState<TrackId>('investors');
  const [menuOpen, setMenuOpen] = useState(false);
  const [question, setQuestion] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const track = tracks.find((t) => t.id === trackId)!;
  const cabinet = token ? '/dashboard' : '/register';
  const totalPrograms = tracks.reduce((sum, t) => sum + t.pieces.length, 0);

  const sendQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!question.name.trim() || !question.email.trim() || !question.message.trim()) {
      toast.error('Укажите имя, email и сообщение');
      return;
    }
    setSending(true);
    const body = [
      question.message.trim(),
      '',
      `ФИО: ${question.name.trim()}`,
      question.phone.trim() ? `Телефон: ${question.phone.trim()}` : '',
      `Email: ${question.email.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');
    window.location.href = `mailto:office@kse.kg?subject=${encodeURIComponent(
      'Вопрос в учебный центр КФБ',
    )}&body=${encodeURIComponent(body)}`;
    toast.success('Откроется почтовая программа — отправьте письмо в учебный центр');
    setQuestion({ name: '', phone: '', email: '', message: '' });
    setSending(false);
  };

  const set = (key: keyof typeof question) => (e: { target: { value: string } }) =>
    setQuestion((s) => ({ ...s, [key]: e.target.value }));

  return (
    <div className="kl">
      <header className="kl-header">
        <div className="kl-wrap kl-header-in">
          <BrandLogo variant={theme === 'dark' ? 'dark' : 'light'} />
          <nav className="kl-nav" aria-label="Разделы">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="kl-actions">
            <a href="https://www.kse.kg/ru" className="kl-ghost">
              Сайт КФБ
            </a>
            <button
              type="button"
              className="kl-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to={token ? '/dashboard' : '/login'} className="kl-primary">
              {token ? 'В кабинет' : 'Войти'}
            </Link>
            <button
              type="button"
              className="kl-icon-btn kl-burger"
              aria-label="Меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <i />
              <i />
              <i />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="kl-wrap kl-mobile-nav" aria-label="Разделы">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="https://www.kse.kg/ru">Сайт КФБ</a>
          </nav>
        )}
      </header>

      <section className="kl-hero" aria-label="Учебный центр КФБ">
        <span className="kl-blob kl-blob-a" />
        <span className="kl-blob kl-blob-b" />
        <span className="kl-blob kl-blob-c" />
        <HeroScene />
        <div className="kl-wrap kl-hero-in">
          <div className="kl-hero-copy">
            <h1>Курсы по финансовому рынку</h1>
            <p>
              Образовательная платформа Кыргызской фондовой биржи для частных инвесторов, студентов и специалистов рынка ценных бумаг.
            </p>
            <div className="kl-hero-actions">
              <Link to={cabinet} className="kl-primary">
                {token ? 'Открыть кабинет' : 'Начать'}
                <Arrow />
              </Link>
              <a href="#courses" className="kl-link">
                Программы
                <Arrow />
              </a>
            </div>
          </div>
          <div className="kl-tracks" role="tablist" aria-label="Программы">
            <small>Направления</small>
            {tracks.map((item, index) => {
              const on = item.id === trackId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className="kl-track"
                  onClick={() => setTrackId(item.id)}
                >
                  <span className="kl-track-n">{String(index + 1).padStart(2, '0')}</span>
                  <span>
                    <b>{item.label}</b>
                    {on && <span>{item.intro}</span>}
                  </span>
                  <ChevronRight />
                </button>
              );
            })}
          </div>
        </div>
        <div className="kl-stats">
          <div className="kl-stat">
            <small>Готовим специалистов</small>
            <b>
              1995<em>с года</em>
            </b>
          </div>
          <div className="kl-stat">
            <small>Программ обучения</small>
            <b>{totalPrograms}</b>
          </div>
          <div className="kl-stat">
            <small>Форматов</small>
            <b>{steps.length}</b>
          </div>
          <div className="kl-stat">
            <small>Лицензия на подготовку</small>
            <b>
              2001<em>с года</em>
            </b>
          </div>
        </div>
      </section>

      <main className="kl-wrap kl-main">
        <section id="about" className="kl-card">
          <div className="kl-about">
            <h2>Финансовая грамотность и подготовка специалистов рынка</h2>
            <div>
              <p>
                Учебный центр КФБ — образовательная инициатива ЗАО «Кыргызская фондовая биржа». С 1995 года готовим специалистов рынка ценных бумаг: брокеров, сотрудников эмитентов, частных инвесторов и студентов.
              </p>
              <p>
                На платформе — онлайн-курсы, вебинары и материалы для широкой аудитории. Очные программы идут по учебному плану года: рынок ценных бумаг, корпоративное управление, ESG, сукук и стратегическое управление.
              </p>
            </div>
          </div>
        </section>

        <section id="courses" className="kl-card">
          <header className="kl-card-head">
            <h2>Программа</h2>
            <div className="kl-pills" role="tablist" aria-label="Направления">
              {tracks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={item.id === trackId}
                  onClick={() => setTrackId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p>{track.intro}</p>
          </header>
          <ol className="kl-rows" key={track.id}>
            {track.pieces.map((piece, i) => (
              <li key={piece.n} className="kl-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="kl-row-n">{piece.n}</span>
                <div>
                  <h3>{piece.title}</h3>
                  <p>{piece.text}</p>
                </div>
                <span className="kl-tag">{piece.meta}</span>
              </li>
            ))}
          </ol>
          <footer className="kl-card-foot">
            <p>{track.note ?? 'Онлайн-модули открываются в личном кабинете сразу после регистрации.'}</p>
            <Link to={cabinet} className="kl-primary">
              {token ? 'Перейти к курсам' : 'Открыть программу'}
              <Arrow />
            </Link>
          </footer>
        </section>

        <div className="kl-section-title">
          <small>Как проходит обучение</small>
          <h2>Форматы обучения</h2>
          <p>Онлайн в кабинете, очно по учебному плану или корпоративной группой</p>
        </div>

        <section id="formats" className="kl-card">
          <div className="kl-cells" style={{ '--cols': 3 } as CSSProperties}>
            {steps.map((step, i) => {
              const Icon = formatIcons[i] ?? CirclePlay;
              return (
                <article key={step.n} className="kl-cell">
                  <span className="kl-cell-icon">
                    <Icon />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="kl-card">
          <header className="kl-card-head">
            <h2>Почему учебный центр КФБ</h2>
          </header>
          <div className="kl-cells" style={{ '--cols': 3 } as CSSProperties}>
            {reasons.map((item, i) => {
              const Icon = reasonIcons[i] ?? ShieldCheck;
              return (
                <article key={item.title} className="kl-cell">
                  <span className="kl-cell-icon">
                    <Icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="faq" className="kl-card">
          <header className="kl-card-head">
            <h2>Частые вопросы</h2>
          </header>
          <div className="kl-faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <ChevronDown />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contacts" className="kl-card">
          <header className="kl-card-head">
            <h2>По вопросам обучения</h2>
          </header>
          <div className="kl-contacts">
            <ul className="kl-contact-list">
              <li>
                <Mail />
                <span>
                  <small>Почта</small>
                  <a href="mailto:office@kse.kg">office@kse.kg</a>
                </span>
              </li>
              <li>
                <Phone />
                <span>
                  <small>Учебный центр</small>
                  <a href="tel:+996772637997">+996 772 63-79-97</a>
                </span>
              </li>
              <li>
                <Phone />
                <span>
                  <small>Приёмная</small>
                  <a href="tel:+996312311484">+996 312 31-14-84</a>
                </span>
              </li>
              <li>
                <MessageCircle />
                <span>
                  <small>WhatsApp</small>
                  <a href="https://wa.me/996551311484" target="_blank" rel="noreferrer">
                    +996 551 31-14-84
                  </a>
                </span>
              </li>
              <li>
                <CalendarDays />
                <span>
                  <small>Расписание</small>
                  <a href="https://www.kse.kg/ru/EduPlan" target="_blank" rel="noreferrer">
                    Учебный план на 2026 год
                  </a>
                </span>
              </li>
            </ul>
            <form className="kl-form" onSubmit={sendQuestion}>
              <h3>Не нашли свой вопрос?</h3>
              <p>Задайте его нам — ответим по почте или телефону.</p>
              <label>
                ФИО
                <input value={question.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label>
                Телефон
                <input value={question.phone} onChange={set('phone')} autoComplete="tel" />
              </label>
              <label className="kl-wide">
                Email
                <input type="email" value={question.email} onChange={set('email')} autoComplete="email" />
              </label>
              <label className="kl-wide">
                Сообщение
                <textarea value={question.message} onChange={set('message')} />
              </label>
              <button type="submit" disabled={sending} className="kl-primary">
                Отправить
                <Arrow />
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="kl-footer">
        <div className="kl-wrap">
          <div className="kl-banner">
            <div>
              <p>
                Учебный центр КФБ готовит специалистов рынка ценных бумаг с 1995 года.
                <small>С 2001 года — по лицензии на подготовку специалистов рынка ценных бумаг.</small>
              </p>
              <ul>
                <li>
                  <Phone />
                  <a href="tel:+996772637997">+996 772 63-79-97</a>
                </li>
                <li>
                  <Mail />
                  <a href="mailto:office@kse.kg">office@kse.kg</a>
                </li>
              </ul>
            </div>
            <Link to={cabinet} className="kl-primary kl-banner-cta">
              {token ? 'Открыть кабинет' : 'Начать обучение'}
              <Arrow />
            </Link>
          </div>
          <div className="kl-footer-bottom">
            <span>
              © {new Date().getFullYear()} ЗАО «Кыргызская фондовая биржа». Материалы учебного центра — для обучения, не являются индивидуальной инвестиционной рекомендацией.
            </span>
            <nav aria-label="Ссылки">
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
              <a href="https://www.kse.kg/ru/Education">О центре на kse.kg</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
