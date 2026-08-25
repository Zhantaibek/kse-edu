import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const password = async (plain: string) => bcrypt.hash(plain, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@edu.local',
      passwordHash: await password('Admin123!'),
      role: 'ADMIN',
      profile: { create: { firstName: 'Алексей', lastName: 'Админов', bio: 'Системный администратор' } },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@edu.local',
      passwordHash: await password('Teacher123!'),
      role: 'TEACHER',
      profile: {
        create: {
          firstName: 'Мария',
          lastName: 'Иванова',
          bio: 'Senior Frontend Developer & Instructor',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        },
      },
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@edu.local',
      passwordHash: await password('Teacher123!'),
      role: 'TEACHER',
      profile: {
        create: {
          firstName: 'Игорь',
          lastName: 'Петров',
          bio: 'Backend engineer',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor',
        },
      },
    },
  });

  const students = await Promise.all(
    [
      ['student@edu.local', 'Анна', 'Смирнова'],
      ['student2@edu.local', 'Дмитрий', 'Козлов'],
      ['student3@edu.local', 'Елена', 'Новикова'],
      ['student4@edu.local', 'Сергей', 'Волков'],
      ['student5@edu.local', 'Ольга', 'Морозова'],
    ].map(async ([email, firstName, lastName]) =>
      prisma.user.create({
        data: {
          email,
          passwordHash: await password('Student123!'),
          role: 'STUDENT',
          profile: {
            create: {
              firstName,
              lastName,
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
            },
          },
        },
      }),
    ),
  );

  const categories = await Promise.all(
    [
      ['Программирование', 'programming', 'Курсы по разработке ПО'],
      ['Дизайн', 'design', 'UI/UX и графический дизайн'],
      ['Бизнес', 'business', 'Менеджмент и маркетинг'],
      ['Данные', 'data', 'Аналитика и Data Science'],
    ].map(([name, slug, description]) =>
      prisma.category.create({ data: { name, slug, description } }),
    ),
  );

  const jsCourse = await prisma.course.create({
    data: {
      title: 'Современный JavaScript',
      slug: 'modern-javascript',
      description:
        'Полный курс по современному JavaScript: от основ до async/await, API и практических проектов.',
      coverUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0b9df?w=1200',
      level: 'BEGINNER',
      durationHours: 24,
      price: 4990,
      status: 'PUBLISHED',
      rating: 4.8,
      teacherId: teacher.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: 'Introduction',
            order: 1,
            lessons: {
              create: [
                { title: 'Welcome', order: 1, contentType: 'VIDEO', durationMin: 8, videoUrl: 'https://example.com/v1', content: 'Добро пожаловать на курс' },
                { title: 'Setup', order: 2, contentType: 'TEXT', durationMin: 12, content: 'Установка окружения: Node.js, VS Code, Git.' },
                { title: 'First Script', order: 3, contentType: 'TEXT', durationMin: 15, content: 'Пишем первый скрипт и запускаем его.' },
              ],
            },
          },
          {
            title: 'JavaScript Basics',
            order: 2,
            lessons: {
              create: [
                { title: 'Variables', order: 1, contentType: 'TEXT', durationMin: 20, content: 'let, const, var и области видимости.' },
                { title: 'Functions', order: 2, contentType: 'VIDEO', durationMin: 25, videoUrl: 'https://example.com/v2', content: 'Function declaration, expression, arrow.' },
                { title: 'Arrays', order: 3, contentType: 'TEXT', durationMin: 22, content: 'Массивы и методы map, filter, reduce.' },
              ],
            },
          },
          {
            title: 'Advanced JavaScript',
            order: 3,
            lessons: {
              create: [
                { title: 'Promises', order: 1, contentType: 'TEXT', durationMin: 30, content: 'Промисы и цепочки then/catch.' },
                { title: 'Async/Await', order: 2, contentType: 'VIDEO', durationMin: 28, videoUrl: 'https://example.com/v3', content: 'Синхронный стиль асинхронного кода.' },
                { title: 'API', order: 3, contentType: 'LINK', durationMin: 35, linkUrl: 'https://developer.mozilla.org', content: 'Работа с Fetch API.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const designCourse = await prisma.course.create({
    data: {
      title: 'UI Design Foundations',
      slug: 'ui-design-foundations',
      description: 'Основы визуального дизайна интерфейсов: типографика, цвет, сетки и компоненты.',
      coverUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
      level: 'INTERMEDIATE',
      durationHours: 18,
      price: 3990,
      status: 'PUBLISHED',
      rating: 4.6,
      teacherId: teacher2.id,
      categoryId: categories[1].id,
      modules: {
        create: [
          {
            title: 'Visual Basics',
            order: 1,
            lessons: {
              create: [
                { title: 'Color Theory', order: 1, contentType: 'TEXT', durationMin: 20, content: 'Цветовые модели и палитры.' },
                { title: 'Typography', order: 2, contentType: 'PDF', durationMin: 18, fileUrl: 'https://example.com/typo.pdf', content: 'Иерархия шрифтов.' },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      title: 'Product Analytics',
      slug: 'product-analytics',
      description: 'Черновик курса по продуктовой аналитике.',
      level: 'ADVANCED',
      durationHours: 30,
      price: 7990,
      status: 'DRAFT',
      rating: 0,
      teacherId: teacher.id,
      categoryId: categories[3].id,
    },
  });

  const allLessons = jsCourse.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: students[0].id,
      courseId: jsCourse.id,
      totalLessons,
      completedLessons: 3,
      progressPercent: Math.round((3 / totalLessons) * 1000) / 10,
      lastActivityAt: new Date(),
    },
  });

  await prisma.progress.createMany({
    data: allLessons.slice(0, 3).map((lesson) => ({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      completed: true,
      completedAt: new Date(),
    })),
  });

  await prisma.enrollment.create({
    data: {
      userId: students[1].id,
      courseId: jsCourse.id,
      totalLessons,
      completedLessons: 1,
      progressPercent: Math.round((1 / totalLessons) * 1000) / 10,
      lastActivityAt: new Date(),
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: students[0].id,
      courseId: designCourse.id,
      totalLessons: 2,
      completedLessons: 0,
      progressPercent: 0,
      lastActivityAt: new Date(),
    },
  });

  const assignment = await prisma.assignment.create({
    data: {
      courseId: jsCourse.id,
      creatorId: teacher.id,
      title: 'Домашнее задание: Functions',
      description: 'Напишите 5 функций для работы с массивами и приложите ссылку на репозиторий.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      materialUrl: 'https://example.com/hw1.pdf',
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: students[0].id,
      textAnswer: 'Решение приложено в репозитории',
      linkUrl: 'https://github.com/example/hw1',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  await prisma.payment.createMany({
    data: [
      {
        userId: students[0].id,
        courseId: jsCourse.id,
        amount: 4990,
        status: 'PAID',
        paymentMethod: 'CARD',
        paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: students[1].id,
        courseId: jsCourse.id,
        amount: 4990,
        status: 'PAID',
        paymentMethod: 'MOCK',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: students[2].id,
        courseId: designCourse.id,
        amount: 3990,
        status: 'PENDING',
        paymentMethod: 'PAYPAL',
      },
      {
        userId: students[3].id,
        courseId: designCourse.id,
        amount: 3990,
        status: 'FAILED',
        paymentMethod: 'CARD',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: teacher.id,
        type: 'ENROLLMENT',
        title: 'Новый студент',
        message: 'Анна Смирнова записалась на курс «Современный JavaScript»',
      },
      {
        userId: students[0].id,
        type: 'NEW_ASSIGNMENT',
        title: 'Новое задание',
        message: 'Домашнее задание: Functions',
      },
      {
        userId: students[0].id,
        type: 'PAYMENT_SUCCESS',
        title: 'Оплата успешна',
        message: 'Оплата курса «Современный JavaScript» прошла успешно',
        isRead: true,
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Система готова',
        message: 'Educational CRM успешно инициализирована',
      },
    ],
  });

  console.log('Seed completed');
  console.log('Admin:   admin@edu.local / Admin123!');
  console.log('Teacher: teacher@edu.local / Teacher123!');
  console.log('Student: student@edu.local / Student123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
