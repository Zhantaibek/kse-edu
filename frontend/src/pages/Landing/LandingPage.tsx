import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuthStore } from '../../store/authStore';

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

const field =
  'mt-1 w-full border border-[#14171a] bg-white px-3 py-3 text-[15px] text-[#14171a] outline-none';

export function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const [trackId, setTrackId] = useState<TrackId>('investors');
  const [menuOpen, setMenuOpen] = useState(false);
  const [question, setQuestion] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const track = tracks.find((t) => t.id === trackId)!;
  const cabinet = token ? '/dashboard' : '/register';

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

  return (
    <div className="kse-official">
      <header className="sticky top-0 z-20 border-b border-[#14171a] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandLogo />
          <nav className="hidden items-center gap-6 text-[14px] lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#8e1d2c]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://www.kse.kg/ru" className="hidden text-[14px] sm:inline">
              Сайт КФБ
            </a>
            {token ? (
              <Link to="/dashboard" className="bg-[#8e1d2c] px-4 py-2 text-[14px] font-medium text-white">
                В кабинет
              </Link>
            ) : (
              <Link to="/login" className="text-[14px]">
                Войти
              </Link>
            )}
            <button type="button" className="text-[14px] lg:hidden" onClick={() => setMenuOpen((v) => !v)}>
              Меню
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="flex flex-col gap-2 border-t border-[#14171a] px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-1 text-sm uppercase tracking-[0.12em]">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <h1 className="max-w-[14ch] text-[2.6rem] font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Курсы по финансовому рынку
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-[#3e454c]">
            Образовательная платформа Кыргызской фондовой биржи для частных инвесторов, студентов и специалистов рынка ценных бумаг.
          </p>
          <Link to={cabinet} className="mt-8 inline-block bg-[#8e1d2c] px-6 py-3 text-[15px] font-medium text-white">
            {token ? 'Открыть кабинет' : 'Начать'}
          </Link>
        </div>
        <div role="tablist" aria-label="Программы" className="border-t border-[#14171a]">
          {tracks.map((item, index) => {
            const on = item.id === trackId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTrackId(item.id)}
                className={`block w-full border-b border-[#14171a] px-4 py-4 text-left transition-colors ${on ? 'bg-[#14171a] text-white' : 'bg-white hover:bg-[#f4f5f6]'}`}
              >
                <span className="text-xs tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                <span className="mt-1 block text-lg">{item.label}</span>
                {on && <span className="mt-2 block text-sm leading-relaxed text-white/80">{item.intro}</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section id="about" className="border-y border-[#14171a]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr]">
          <h2 className="text-4xl leading-[0.95] sm:text-5xl">
            Финансовая грамотность и подготовка специалистов рынка
          </h2>
          <div className="space-y-4 text-[17px] leading-relaxed">
            <p>
              Учебный центр КФБ — образовательная инициатива ЗАО «Кыргызская фондовая биржа». С 1995 года готовим специалистов рынка ценных бумаг: брокеров, сотрудников эмитентов, частных инвесторов и студентов.
            </p>
            <p>
              На платформе — онлайн-курсы, вебинары и материалы для широкой аудитории. Очные программы идут по учебному плану года: рынок ценных бумаг, корпоративное управление, ESG, сукук и стратегическое управление.
            </p>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-4xl sm:text-5xl">Программа</h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed">{track.intro}</p>
        <ol className="mt-10 divide-y divide-[#14171a] border-y border-[#14171a]">
          {track.pieces.map((piece) => (
            <li key={piece.n} className="grid gap-3 py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline">
              <span className="text-3xl">{piece.n}</span>
              <div>
                <h3 className="text-xl">{piece.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#3e454c]">{piece.text}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.12em]">{piece.meta}</span>
            </li>
          ))}
        </ol>
        {track.note && <p className="mt-6 max-w-2xl text-sm leading-relaxed">{track.note}</p>}
        <Link to={cabinet} className="mt-8 inline-block border border-[#14171a] px-5 py-3 text-sm uppercase tracking-[0.14em]">
          {token ? 'Перейти к курсам' : 'Открыть программу'}
        </Link>
      </section>

      <section id="formats" className="border-y border-[#14171a] bg-[#f4f5f6]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-4xl sm:text-5xl">Форматы обучения</h2>
          <ol className="space-y-6">
            {steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="text-3xl text-[#8e1d2c]">{step.n}</span>
                <div>
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-4xl sm:text-5xl">Почему учебный центр КФБ</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {reasons.map((item, i) => (
            <p key={item.title} className="border-t border-[#14171a] pt-4">
              <span className="text-3xl text-[#8e1d2c]">{i + 1}</span>
              <span className="mt-2 block text-lg">{item.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-[#3e454c]">{item.text}</span>
            </p>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t border-[#14171a]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-4xl sm:text-5xl">Частые вопросы</h2>
          <div className="mt-8 divide-y divide-[#14171a] border-y border-[#14171a]">
            {faqs.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-[#8e1d2c] group-open:hidden">+</span>
                    <span className="hidden text-[#8e1d2c] group-open:inline">–</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="border-t border-[#14171a] bg-[#f4f5f6]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl sm:text-5xl">По вопросам обучения</h2>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed">
              <li>
                <a className="underline decoration-[#8e1d2c] underline-offset-4" href="mailto:office@kse.kg">
                  office@kse.kg
                </a>
              </li>
              <li>Учебный центр: +996 772 63-79-97</li>
              <li>Приёмная: +996 312 31-14-84</li>
              <li>WhatsApp: +996 551 31-14-84</li>
              <li>
                <a className="underline decoration-[#8e1d2c] underline-offset-4" href="https://www.kse.kg/ru/EduPlan" target="_blank" rel="noreferrer">
                  Учебный план на 2026 год
                </a>
              </li>
            </ul>
          </div>
          <form className="space-y-3" onSubmit={sendQuestion}>
            <h3 className="text-3xl">Не нашли свой вопрос?</h3>
            <p className="text-sm">Задайте его нам — ответим по почте или телефону.</p>
            <label className="block text-xs uppercase tracking-[0.14em]">
              ФИО
              <input className={`${field} mt-1`} value={question.name} onChange={(e) => setQuestion((s) => ({ ...s, name: e.target.value }))} />
            </label>
            <label className="block text-xs uppercase tracking-[0.14em]">
              Телефон
              <input className={`${field} mt-1`} value={question.phone} onChange={(e) => setQuestion((s) => ({ ...s, phone: e.target.value }))} />
            </label>
            <label className="block text-xs uppercase tracking-[0.14em]">
              Email
              <input className={`${field} mt-1`} type="email" value={question.email} onChange={(e) => setQuestion((s) => ({ ...s, email: e.target.value }))} />
            </label>
            <label className="block text-xs uppercase tracking-[0.14em]">
              Сообщение
              <textarea className={`${field} mt-1 min-h-28`} value={question.message} onChange={(e) => setQuestion((s) => ({ ...s, message: e.target.value }))} />
            </label>
            <button type="submit" disabled={sending} className="bg-[#14171a] px-5 py-3 text-[15px] text-white disabled:opacity-60">
              Отправить
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#14171a] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row">
          <div>
            <BrandLogo />
            <p className="mt-3 max-w-sm text-sm">ЗАО «Кыргызская фондовая биржа». Учебный центр по подготовке специалистов рынка ценных бумаг.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
            <a href="https://www.kse.kg/ru/Education">О центре на kse.kg</a>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs">
          © {new Date().getFullYear()} ЗАО «Кыргызская фондовая биржа». Материалы учебного центра — для обучения, не являются индивидуальной инвестиционной рекомендацией.
        </p>
      </footer>
    </div>
  );
}
