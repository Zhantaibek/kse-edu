import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  GraduationCap,
  BookOpen,
  Sparkles,
  Wallet,
  UserPlus,
  Archive,
} from 'lucide-react';
import api from '../../services/api';
import type { Course, DashboardData } from '../../types';
import { Card, PageHeader, Skeleton, Avatar, Badge, ProgressBar, EmptyState } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { formatDate, formatMoney, fullName } from '../../utils';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils';
import { CourseCard } from '../../components/courses/CourseCard';
import { useStudentContentProtection } from '../../hooks/useStudentContentProtection';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === 'STUDENT';
  useStudentContentProtection(isStudent);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isStudent) {
          const [enrollments, courses, cats] = await Promise.all([
            api.get('/enrollments/mine'),
            api.get('/courses?status=PUBLISHED&limit=50'),
            api.get('/categories'),
          ]);
          const mine = enrollments.data.data as Array<{
            id: string;
            progressPercent: number;
            lastActivityAt?: string;
            course?: Course;
          }>;
          const enrolledIds = new Set(mine.map((e) => e.course?.id).filter(Boolean));
          const available = (courses.data.data as Course[]).filter((c) => !enrolledIds.has(c.id));
          setCatalog(available);
          setCategories(cats.data.data);
          setData({
            stats: {
              students: 0,
              teachers: 0,
              courses: available.length,
              activeCourses: mine.length,
              completedCourses: mine.filter((e) => e.progressPercent >= 100).length,
              revenue: 0,
              newUsersMonth: 0,
            },
            registrationChart: [],
            salesChart: [],
            popularCourses: courses.data.data.slice(0, 5),
            recentUsers: [],
            recentPayments: [],
            activity: mine.map((e) => ({
              id: e.id,
              progressPercent: e.progressPercent,
              lastActivityAt: e.lastActivityAt,
              course: e.course,
              user,
            })),
          });
        } else {
          const res = await api.get('/analytics/dashboard');
          setData(res.data.data);
          setCatalog([]);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user, isStudent]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return catalog.filter((c) => {
      if (catalogCategory && c.categoryId !== catalogCategory) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [catalog, catalogSearch, catalogCategory]);

  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isStudent) {
    return (
      <div>
        <PageHeader
          title="Обзор"
          description={`Добро пожаловать, ${fullName(user)}. Здесь курсы, доступные для покупки.`}
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Мои курсы', value: data.stats.activeCourses, icon: BookOpen, accent: true },
            { label: 'Завершено', value: data.stats.completedCourses, icon: Sparkles, accent: false },
            { label: 'Доступно купить', value: data.stats.courses, icon: Archive, accent: false },
          ].map((card, i) => (
            <Card
              key={card.label}
              className={cn(
                'relative overflow-hidden p-5 transition duration-300 hover:shadow-md',
                card.accent &&
                  'border-brand-200 bg-gradient-to-br from-brand-50/90 to-panel dark:from-brand-900/40 dark:to-panel-dark dark:border-brand-800',
                i === 0 && 'animate-fade-up',
              )}
            >
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-kse-muted">{card.label}</div>
                  <div className="mt-2 font-display text-2xl font-bold tracking-tight">{card.value}</div>
                </div>
                <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-800/40 dark:text-brand-300">
                  <card.icon size={18} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
            Доступные курсы
          </h2>
          <p className="mt-1 text-sm text-kse-muted">Выберите программу и оформите покупку или запись</p>
        </div>

        <Card className="mb-5 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-2">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Поиск курсов…"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
            />
          </div>
          <Select
            className="sm:w-44"
            value={catalogCategory}
            onChange={(e) => setCatalogCategory(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="shrink-0 px-2 text-sm font-medium text-kse-muted">
            {filteredCatalog.length} курсов
          </div>
        </Card>

        {filteredCatalog.length === 0 ? (
          <EmptyState
            title="Нет курсов для покупки"
            description="Все доступные программы уже у вас, или измените фильтры"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCatalog.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const primary = [
    { label: 'Доход', value: formatMoney(data.stats.revenue), icon: Wallet, accent: true },
    { label: 'Студенты', value: data.stats.students, icon: Users, accent: false },
    { label: 'Курсы', value: data.stats.courses, icon: BookOpen, accent: false },
    { label: 'Новые за месяц', value: data.stats.newUsersMonth, icon: UserPlus, accent: false },
  ];

  const secondary = [
    { label: 'Преподаватели', value: data.stats.teachers, icon: GraduationCap },
    { label: 'Активные', value: data.stats.activeCourses, icon: Sparkles },
    { label: 'Архив', value: data.stats.completedCourses, icon: Archive },
  ];

  return (
    <div>
      <PageHeader title="Обзор" description={`Добро пожаловать, ${fullName(user)}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((card, i) => (
          <Card
            key={card.label}
            className={cn(
              'relative overflow-hidden p-5 transition duration-300 hover:shadow-md',
              card.accent &&
                'border-brand-200 bg-gradient-to-br from-brand-50/90 to-panel dark:from-brand-900/40 dark:to-panel-dark dark:border-brand-800',
              i === 0 && 'animate-fade-up',
            )}
          >
            {card.accent && (
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-300/25 blur-2xl" />
            )}
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-kse-muted">{card.label}</div>
                <div className="mt-2 font-display text-2xl font-bold tracking-tight">{card.value}</div>
              </div>
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-800/40 dark:text-brand-300">
                <card.icon size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {secondary.map((card) => (
          <Card key={card.label} className="flex items-center gap-3 px-4 py-3">
            <div className="rounded-lg bg-kse-surface p-2 text-brand-600 dark:bg-border-dark dark:text-brand-300">
              <card.icon size={16} />
            </div>
            <div>
              <div className="text-xs text-kse-muted">{card.label}</div>
              <div className="text-lg font-bold tracking-tight">{card.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 font-semibold tracking-tight">Регистрации студентов</h3>
          <p className="mb-4 text-xs text-kse-muted">Динамика за последние месяцы</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.registrationChart}>
                <defs>
                  <linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#51adba" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#51adba" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b949a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8b949a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e1e5e8',
                    boxShadow: '0 8px 24px rgba(30,44,50,0.08)',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#51adba" strokeWidth={2.5} fill="url(#reg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-1 font-semibold tracking-tight">Продажи курсов</h3>
          <p className="mb-4 text-xs text-kse-muted">Выручка mock-платежей</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b949a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8b949a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e1e5e8' }} />
                <Bar dataKey="total" fill="#348191" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <h3 className="mb-4 font-semibold tracking-tight">Популярные курсы</h3>
          <div className="space-y-2">
            {data.popularCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-kse-surface/80 px-3 py-2.5 transition hover:border-brand-200 hover:bg-brand-50/50 dark:bg-border-dark/40 dark:hover:border-brand-800"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{course.title}</div>
                  <div className="text-xs text-kse-muted">{course._count?.enrollments ?? 0} студентов</div>
                </div>
                <Badge tone="teal">★ {course.rating}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold tracking-tight">Новые пользователи</h3>
          <div className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar name={fullName(u)} src={u.profile?.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{fullName(u)}</div>
                  <div className="text-xs text-kse-muted">{formatDate(u.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-semibold tracking-tight">Последние оплаты</h3>
          <div className="space-y-3">
            {data.recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.course?.title}</div>
                  <div className="text-xs text-kse-muted">{fullName(p.user)}</div>
                </div>
                <div className="text-sm font-bold text-brand-700 dark:text-brand-300">{formatMoney(p.amount)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-kse-border px-5 py-4 dark:border-border-dark">
          <h3 className="font-semibold tracking-tight">Активность</h3>
        </div>
        <div className="overflow-x-auto px-5 pb-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-kse-muted">
                <th className="py-3 pr-4">Пользователь</th>
                <th className="py-3 pr-4">Курс</th>
                <th className="min-w-[140px] py-3 pr-4">Прогресс</th>
                <th className="py-3">Активность</th>
              </tr>
            </thead>
            <tbody>
              {data.activity.map((item) => (
                <tr key={item.id} className="border-t border-kse-border/70 dark:border-border-dark">
                  <td className="py-3.5 pr-4 font-medium">{fullName(item.user)}</td>
                  <td className="py-3.5 pr-4 text-kse-muted">{item.course?.title}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="min-w-[80px] flex-1">
                        <ProgressBar value={item.progressPercent} />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold tabular-nums">
                        {item.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-kse-muted">{formatDate(item.lastActivityAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
