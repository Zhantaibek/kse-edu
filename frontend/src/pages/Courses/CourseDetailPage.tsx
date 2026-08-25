import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListVideo,
  ImageIcon,
  Lock,
  Maximize,
  Pause,
  Play,
  PlayCircle,
  Star,
  Type,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import api from '../../services/api';
import type { Course, CourseReview, Lesson, Module } from '../../types';
import {
  formatDate,
  formatMoney,
  fullName,
  getErrorMessage,
  resolveMediaUrl,
  statusLabel,
  youtubeEmbedUrl,
  cn,
} from '../../utils';
import { Card, Badge, ProgressBar, Skeleton, Avatar } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { MockPaymentModal } from '../../components/payments/MockPaymentModal';
import { useAuthStore } from '../../store/authStore';
import { useStudentContentProtection } from '../../hooks/useStudentContentProtection';

type LessonType = 'TEXT' | 'VIDEO' | 'IMAGE';

function formatPlayerTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function lessonTypeLabel(type: string) {
  if (type === 'VIDEO') return 'Видео';
  if (type === 'IMAGE') return 'Изображение';
  return 'Текст';
}

/** Защита контента урока для студентов: нельзя копировать / выделять текст. */
function StudentLessonGuard({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;

  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="relative select-none"
      onCopy={block}
      onCut={block}
      onContextMenu={block}
      onDragStart={block}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {children}
    </div>
  );
}

function FormattedLessonText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink dark:text-kse-gray">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines[0].startsWith('# ')) {
          return (
            <div key={i} className="space-y-2">
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">{lines[0].slice(2)}</h3>
              {lines.slice(1).length > 0 && <p className="whitespace-pre-wrap">{lines.slice(1).join('\n')}</p>}
            </div>
          );
        }
        if (lines.every((l) => l.trim().startsWith('- ') || l.trim() === '')) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>{l.replace(/^\s*-\s*/, '')}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function VideoPlaylistMenu({
  currentId,
  items,
  onSelect,
  align = 'right',
}: {
  currentId: string;
  items: Lesson[];
  onSelect: (id: string) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Список видео"
      >
        <ListVideo size={15} />
        <span className="hidden sm:inline">Видео</span>
        <ChevronDown size={13} className={cn('transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#122025]/95 shadow-2xl backdrop-blur-xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            Видеоматериалы · {items.length}
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {items.map((item, i) => {
              const active = item.id === currentId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                    active ? 'bg-brand-500/25 text-white' : 'text-white/80 hover:bg-white/10',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                      active ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/60',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate">{item.title}</span>
                  {active && <Play size={12} className="ml-auto shrink-0 fill-current" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BrandVideoPlayer({
  src,
  title,
  currentId,
  playlist,
  onSelectLesson,
  protect,
}: {
  src: string;
  title: string;
  currentId: string;
  playlist: Lesson[];
  onSelectLesson: (id: string) => void;
  protect?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const revealControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setControlsVisible(true);
  }, [src]);

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      setPlaying(true);
      revealControls();
    } else {
      el.pause();
      setPlaying(false);
      setControlsVisible(true);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={shellRef}
      className="lesson-player group relative aspect-video overflow-hidden rounded-2xl bg-[#0c1619] shadow-[0_20px_50px_-28px_rgba(52,129,145,0.65)] ring-1 ring-white/10"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={resolveMediaUrl(src)}
        playsInline
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture={Boolean(protect)}
        onContextMenu={protect ? (e) => e.preventDefault() : undefined}
        onClick={() => void togglePlay()}
        onTimeUpdate={() => setCurrent(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
      />

      {!playing && (
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-[#0c1619]/75 via-transparent to-[#0c1619]/25"
          aria-label="Смотреть"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_12px_40px_-8px_rgba(81,173,186,0.9)] transition hover:scale-105 hover:bg-brand-400">
            <Play size={28} className="ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      <div
        className={cn(
          'absolute right-3 top-3 z-30 transition duration-300',
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <VideoPlaylistMenu currentId={currentId} items={playlist} onSelect={onSelectLesson} />
      </div>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-10 transition duration-300',
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="mb-2 truncate text-xs font-medium text-white/80">{title}</div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          className="lesson-player-range mb-2.5 w-full"
          onChange={(e) => {
            const t = Number(e.target.value);
            if (videoRef.current) videoRef.current.currentTime = t;
            setCurrent(t);
            revealControls();
          }}
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10"
            onClick={() => void togglePlay()}
            aria-label={playing ? 'Пауза' : 'Play'}
          >
            {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10"
            onClick={toggleMute}
            aria-label={muted ? 'Включить звук' : 'Без звука'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <span className="ml-1 text-[11px] tabular-nums text-white/70">
            {formatPlayerTime(current)} / {formatPlayerTime(duration)}
          </span>
          <button
            type="button"
            className="ml-auto rounded-lg p-1.5 text-white/90 transition hover:bg-white/10"
            onClick={() => void toggleFullscreen()}
            aria-label="Полный экран"
          >
            <Maximize size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonMedia({
  lesson,
  playlist,
  onSelectLesson,
  protect,
}: {
  lesson: Lesson;
  playlist: Lesson[];
  onSelectLesson: (id: string) => void;
  protect?: boolean;
}) {
  const media = (() => {
    if (lesson.contentType === 'VIDEO') {
      const src = lesson.videoUrl || lesson.fileUrl || lesson.linkUrl;
      const yt = youtubeEmbedUrl(src);
      if (yt) {
        return (
          <div className="relative overflow-hidden rounded-2xl bg-[#0c1619] shadow-[0_20px_50px_-28px_rgba(52,129,145,0.65)] ring-1 ring-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/20 text-brand-300">
                <PlayCircle size={14} />
              </span>
              <span className="text-xs font-medium text-white/75">Видеоурок</span>
              <span className="ml-auto flex items-center gap-2">
                <VideoPlaylistMenu
                  currentId={lesson.id}
                  items={playlist}
                  onSelect={onSelectLesson}
                  align="right"
                />
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                  YouTube
                </span>
              </span>
            </div>
            <div className="aspect-video">
              <iframe
                title={lesson.title}
                src={yt}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
      if (src) {
        return (
          <BrandVideoPlayer
            src={src}
            title={lesson.title}
            currentId={lesson.id}
            playlist={playlist}
            onSelectLesson={onSelectLesson}
            protect={protect}
          />
        );
      }
    }

    if (lesson.contentType === 'IMAGE') {
      const src = lesson.fileUrl || lesson.linkUrl || lesson.videoUrl;
      if (src) {
        return (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-kse-surface to-brand-50/40 p-2 ring-1 ring-kse-border dark:from-border-dark/60 dark:to-brand-900/20 dark:ring-border-dark">
            <img
              src={resolveMediaUrl(src)}
              alt={lesson.title}
              className="max-h-[520px] w-full rounded-xl object-contain"
              draggable={!protect}
              onContextMenu={protect ? (e) => e.preventDefault() : undefined}
            />
          </div>
        );
      }
    }
    return null;
  })();

  return (
    <StudentLessonGuard enabled={Boolean(protect)}>
      <div className="space-y-5">
        {media}
        {lesson.content ? (
          <div className="rounded-2xl border border-kse-border/80 bg-kse-surface/50 p-4 dark:border-border-dark dark:bg-border-dark/30">
            <FormattedLessonText text={lesson.content} />
          </div>
        ) : !media ? (
          <p className="text-sm text-kse-muted">Контент урока пока не добавлен</p>
        ) : null}
      </div>
    </StudentLessonGuard>
  );
}

function CourseProgram({
  modules,
  selectedLessonId,
  contentLocked,
  completedSet,
  canManage,
  onSelect,
  onEditLesson,
  onEditModule,
  onDeleteModule,
}: {
  modules: Module[];
  selectedLessonId?: string | null;
  contentLocked: boolean;
  completedSet: Set<string>;
  canManage: boolean;
  onSelect: (id: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (module: Module) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(modules.map((m) => [m.id, true])),
  );

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      for (const m of modules) {
        if (next[m.id] === undefined) next[m.id] = true;
        if (m.lessons.some((l) => l.id === selectedLessonId)) next[m.id] = true;
      }
      return next;
    });
  }, [modules, selectedLessonId]);

  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const doneCount = modules.reduce(
    (n, m) => n + m.lessons.filter((l) => completedSet.has(l.id)).length,
    0,
  );

  const typeIcon = (type: string) => {
    if (type === 'VIDEO') return <PlayCircle size={14} />;
    if (type === 'IMAGE') return <ImageIcon size={14} />;
    return <Type size={14} />;
  };

  let lessonIndex = 0;

  return (
    <Card className="overflow-hidden lg:sticky lg:top-20">
      <div className="border-b border-kse-border bg-gradient-to-br from-brand-50/90 to-transparent px-4 py-4 dark:border-border-dark dark:from-brand-900/25">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">
              Программа
            </h2>
            <p className="mt-0.5 text-xs text-kse-muted">
              {modules.length} модул{modules.length === 1 ? 'ь' : modules.length < 5 ? 'я' : 'ей'} ·{' '}
              {totalLessons} урок{totalLessons === 1 ? '' : totalLessons < 5 ? 'а' : 'ов'}
            </p>
          </div>
          {totalLessons > 0 && (
            <div className="rounded-xl bg-panel px-2.5 py-1.5 text-center shadow-sm dark:bg-panel-dark">
              <div className="font-display text-sm font-bold text-brand-600">
                {doneCount}/{totalLessons}
              </div>
              <div className="text-[10px] text-kse-muted">готово</div>
            </div>
          )}
        </div>
        {totalLessons > 0 && (
          <div className="mt-3">
            <ProgressBar value={totalLessons ? (doneCount / totalLessons) * 100 : 0} />
          </div>
        )}
      </div>

      <div className="max-h-[min(70vh,640px)] overflow-y-auto p-2">
        {modules.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-kse-muted">Модули пока не добавлены</p>
        ) : (
          modules.map((module) => {
            const expanded = open[module.id] !== false;
            const moduleDone = module.lessons.filter((l) => completedSet.has(l.id)).length;
            return (
              <div key={module.id} className="mb-1.5 overflow-hidden rounded-2xl">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-kse-surface dark:hover:bg-border-dark/50"
                    onClick={() => setOpen((s) => ({ ...s, [module.id]: !expanded }))}
                  >
                    <ChevronDown
                      size={16}
                      className={cn(
                        'shrink-0 text-brand-500 transition duration-200',
                        expanded ? 'rotate-0' : '-rotate-90',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink dark:text-white">
                        {module.title}
                      </div>
                      <div className="text-[11px] text-kse-muted">
                        Модуль {module.order}
                        {module.lessons.length > 0
                          ? ` · ${moduleDone}/${module.lessons.length}`
                          : ''}
                      </div>
                    </div>
                  </button>
                  {canManage && (
                    <div className="flex shrink-0 pr-1">
                      <Button size="sm" variant="ghost" onClick={() => onEditModule(module)}>
                        ✎
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void onDeleteModule(module)}>
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                {expanded && (
                  <div className="space-y-0.5 pb-2 pl-2 pr-1">
                    {module.lessons.map((lesson) => {
                      lessonIndex += 1;
                      const idx = lessonIndex;
                      const done = completedSet.has(lesson.id);
                      const active = selectedLessonId === lesson.id;
                      return (
                        <button
                          type="button"
                          key={lesson.id}
                          onClick={() => onSelect(lesson.id)}
                          className={cn(
                            'group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition',
                            active && !contentLocked
                              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                              : 'hover:bg-kse-surface dark:hover:bg-border-dark/40',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums',
                              active && !contentLocked
                                ? 'bg-white/20 text-white'
                                : done
                                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                                  : 'bg-kse-surface text-kse-muted dark:bg-border-dark',
                            )}
                          >
                            {contentLocked ? (
                              <Lock size={12} />
                            ) : done ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              idx
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className={cn(
                                'truncate text-sm font-medium',
                                active && !contentLocked ? 'text-white' : 'text-ink dark:text-white',
                              )}
                            >
                              {lesson.title}
                            </div>
                            <div
                              className={cn(
                                'mt-0.5 flex items-center gap-1.5 text-[11px]',
                                active && !contentLocked ? 'text-white/70' : 'text-kse-muted',
                              )}
                            >
                              {typeIcon(lesson.contentType)}
                              {lessonTypeLabel(lesson.contentType)}
                              {lesson.durationMin > 0 ? ` · ${lesson.durationMin} мин` : ''}
                            </div>
                          </div>
                          {canManage && (
                            <span
                              role="button"
                              tabIndex={0}
                              className={cn(
                                'rounded-lg px-2 py-1 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100',
                                active && !contentLocked
                                  ? 'bg-white/15 text-white'
                                  : 'bg-kse-surface text-kse-muted dark:bg-border-dark',
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditLesson(lesson);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.stopPropagation();
                                  onEditLesson(lesson);
                                }
                              }}
                            >
                              Изм.
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function StarRating({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? 'cursor-default' : 'transition hover:scale-110'}
          aria-label={`${n} из 5`}
        >
          <Star
            size={readOnly ? 16 : 22}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-kse-gray'}
          />
        </button>
      ))}
    </div>
  );
}

export function CourseDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  useStudentContentProtection(user?.role === 'STUDENT');
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    lastActivityAt?: string | null;
    progress?: Array<{ lessonId: string; completed: boolean }>;
  } | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('TEXT');
  const [lessonContent, setLessonContent] = useState('');
  const [mediaSource, setMediaSource] = useState<'url' | 'file'>('url');
  const [mediaUrl, setMediaUrl] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState('');
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<CourseReview | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const loadReviews = async () => {
    const { data } = await api.get(`/courses/${id}/reviews`);
    setReviews(data.data.items);
    setCanReview(Boolean(data.data.canReview));
    const mine = data.data.myReview as CourseReview | null;
    setMyReview(mine);
    if (mine) {
      setReviewRating(mine.rating);
      setReviewComment(mine.comment);
    }
  };

  const load = async () => {
    const { data } = await api.get(`/courses/${id}`);
    setCourse(data.data);
    if (data.data.modules?.[0]) setModuleId((prev) => prev || data.data.modules[0].id);
    try {
      const prog = await api.get(`/courses/${id}/progress`);
      setProgress(prog.data.data);
      setEnrolled(true);
    } catch {
      setProgress(null);
      setEnrolled(false);
    }
    try {
      await loadReviews();
    } catch {
      setReviews([]);
      setCanReview(false);
      setMyReview(null);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  // Последний урок завершается сам, когда все предыдущие уже пройдены
  useEffect(() => {
    if (!course || user?.role !== 'STUDENT' || !enrolled || !progress) return;
    const lessons = (course.modules ?? []).flatMap((m) => m.lessons);
    if (lessons.length === 0) return;
    const selected =
      lessons.find((l) => l.id === selectedLessonId) ?? lessons[0] ?? null;
    if (!selected) return;
    const isLast = lessons[lessons.length - 1]?.id === selected.id;
    if (!isLast) return;
    const done = new Set(
      (progress.progress ?? []).filter((p) => p.completed).map((p) => p.lessonId),
    );
    const othersDone = lessons.filter((l) => l.id !== selected.id).every((l) => done.has(l.id));
    if (!othersDone || done.has(selected.id)) return;
    void (async () => {
      try {
        const { data } = await api.post(`/courses/${id}/progress/complete`, {
          lessonId: selected.id,
        });
        setProgress(data.data);
        if (data.data.progressPercent >= 100) {
          toast.success('Курс пройден. Можно оставить оценку и комментарий');
          void loadReviews();
        }
      } catch {
        // ignore
      }
    })();
  }, [course, selectedLessonId, enrolled, progress, user?.role, id]);

  if (!course) return <Skeleton className="h-96" />;

  const canManage = user?.role === 'ADMIN' || (user?.role === 'TEACHER' && course.teacherId === user.id);
  const contentLocked = user?.role === 'STUDENT' && Boolean(course.locked || !enrolled);
  const completedSet = new Set((progress?.progress ?? []).filter((p) => p.completed).map((p) => p.lessonId));
  const price = Number(course.price);
  const isFree = price <= 0;
  const allLessons = (course.modules ?? []).flatMap((m) => m.lessons);
  const videoLessons = allLessons.filter((l) => l.contentType === 'VIDEO');
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0] ?? null;
  const lessonIndex = selectedLesson ? allLessons.findIndex((l) => l.id === selectedLesson.id) : -1;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  const enroll = async () => {
    try {
      await api.post('/enrollments', { courseId: id });
      toast.success('Вы записались на курс');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const completeLesson = async (lessonId: string, opts?: { silent?: boolean }) => {
    if (user?.role !== 'STUDENT' || !enrolled) return;
    if (completedSet.has(lessonId)) return;
    try {
      const { data } = await api.post(`/courses/${id}/progress/complete`, { lessonId });
      setProgress(data.data);
      if (data.data.progressPercent >= 100) {
        toast.success('Курс пройден. Можно оставить оценку и комментарий');
        void loadReviews();
      } else if (!opts?.silent) {
        // промежуточные переходы — без лишних тостов
      }
    } catch (e) {
      if (!opts?.silent) toast.error(getErrorMessage(e));
    }
  };

  const goToLesson = (lessonId: string) => {
    const currentId = selectedLesson?.id;
    if (currentId && currentId !== lessonId) {
      void completeLesson(currentId, { silent: true });
    }
    setSelectedLessonId(lessonId);
  };

  const saveReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Напишите комментарий');
      return;
    }
    setSavingReview(true);
    try {
      await api.post(`/courses/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success('Спасибо за отзыв');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingReview(false);
    }
  };

  const addModule = async () => {
    if (!moduleTitle.trim()) return;
    try {
      if (editingModuleId) {
        await api.patch(`/modules/${editingModuleId}`, { title: moduleTitle.trim() });
        toast.success('Модуль обновлён');
        setEditingModuleId(null);
      } else {
        await api.post(`/courses/${id}/modules`, { title: moduleTitle.trim() });
        toast.success('Модуль добавлен');
      }
      setModuleTitle('');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const startEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleTitle(module.title);
  };

  const deleteModule = async (module: Module) => {
    if (!confirm(`Удалить модуль «${module.title}» и все его уроки?`)) return;
    try {
      await api.delete(`/modules/${module.id}`);
      if (editingModuleId === module.id) {
        setEditingModuleId(null);
        setModuleTitle('');
      }
      if (module.lessons.some((l) => l.id === selectedLessonId)) setSelectedLessonId(null);
      if (moduleId === module.id) setModuleId('');
      toast.success('Модуль удалён');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const uploadFile = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    const { data } = await api.post('/media/upload', body);
    const url = String(data.data.url);
    if (data.data.kind === 'video') setLessonType('VIDEO');
    if (data.data.kind === 'image') setLessonType('IMAGE');
    setMediaUrl(url);
    return url;
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonContent('');
    setMediaUrl('');
    setPendingFile(null);
    setMediaSource('url');
    setLessonType('TEXT');
  };

  const startEditLesson = (lesson: Lesson) => {
    const type: LessonType =
      lesson.contentType === 'VIDEO' || lesson.contentType === 'IMAGE' ? lesson.contentType : 'TEXT';
    const currentUrl =
      type === 'VIDEO' ? lesson.videoUrl || lesson.fileUrl || lesson.linkUrl || '' : lesson.fileUrl || lesson.linkUrl || '';
    setSelectedLessonId(lesson.id);
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonType(type);
    setLessonContent(lesson.content ?? '');
    setModuleId(lesson.moduleId);
    setPendingFile(null);
    setMediaUrl(currentUrl);
    setMediaSource('url');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resolveMediaForSave = async () => {
    let resolvedUrl = mediaUrl.trim();
    if (lessonType !== 'VIDEO' && lessonType !== 'IMAGE') return resolvedUrl;

    if (mediaSource === 'file') {
      if (!pendingFile && !resolvedUrl) {
        throw new Error('Выберите файл с компьютера');
      }
      if (pendingFile) {
        setUploading(true);
        try {
          resolvedUrl = await uploadFile(pendingFile);
        } finally {
          setUploading(false);
        }
      }
      return resolvedUrl;
    }

    if (!resolvedUrl) {
      throw new Error('Вставьте URL видео или изображения');
    }
    return resolvedUrl;
  };

  const saveLesson = async () => {
    if (!lessonTitle.trim() || !moduleId) return;

    let resolvedUrl = '';
    try {
      resolvedUrl = await resolveMediaForSave();
    } catch (e) {
      toast.error(getErrorMessage(e));
      return;
    }

    setSavingLesson(true);
    try {
      const payload: Record<string, unknown> = {
        title: lessonTitle.trim(),
        contentType: lessonType,
        content: lessonType === 'TEXT' ? lessonContent || 'Новый урок' : lessonContent || null,
        videoUrl: lessonType === 'VIDEO' ? resolvedUrl : null,
        fileUrl: lessonType === 'IMAGE' ? resolvedUrl : null,
      };

      if (editingLessonId) {
        await api.patch(`/lessons/${editingLessonId}`, payload);
        toast.success('Урок обновлён');
      } else {
        await api.post(`/courses/${id}/lessons`, { ...payload, moduleId });
        toast.success('Урок добавлен');
      }
      resetLessonForm();
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingLesson(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Удалить этот урок?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      if (editingLessonId === lessonId) resetLessonForm();
      if (selectedLessonId === lessonId) setSelectedLessonId(null);
      toast.success('Урок удалён');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const publish = async () => {
    try {
      await api.patch(`/courses/${id}`, { status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      toast.success('Статус обновлён');
      void load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const heroBg = course.coverUrl
    ? `linear-gradient(105deg,rgba(21,36,40,.88) 0%,rgba(52,129,145,.55) 55%,rgba(81,173,186,.35) 100%), url(${course.coverUrl})`
    : 'linear-gradient(120deg,#2d6875 0%,#348191 40%,#51adba 100%)';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div
        className="relative mb-6 overflow-hidden rounded-3xl border border-kse-border bg-cover bg-center shadow-[0_16px_40px_-28px_rgba(52,129,145,0.55)] dark:border-border-dark"
        style={{ backgroundImage: heroBg }}
      >
        <div className="relative px-6 py-8 text-white sm:px-8 sm:py-9">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="teal">{statusLabel(course.status)}</Badge>
            <Badge>{statusLabel(course.level)}</Badge>
            {enrolled && <Badge tone="green">Вы записаны</Badge>}
          </div>
          <h1 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-[15px]">{course.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/85">
            <div className="flex items-center gap-2">
              <Avatar name={fullName(course.teacher)} src={course.teacher?.profile?.avatarUrl} size="sm" />
              {fullName(course.teacher)}
            </div>
            <span>
              ★ {Number(course.rating).toFixed(1)}
              {course._count?.reviews ? ` · ${course._count.reviews}` : ''}
            </span>
            <span>{course._count?.enrollments ?? 0} студентов</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} /> {course.durationHours} ч
            </span>
            {enrolled && progress ? (
              <span className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold backdrop-blur">
                Прогресс {progress.progressPercent}%
              </span>
            ) : (
              <span className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold backdrop-blur">
                {isFree ? 'Бесплатно' : formatMoney(course.price)}
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {user?.role === 'STUDENT' && !enrolled && (
              <>
                {isFree ? (
                  <Button onClick={() => void enroll()}>Записаться бесплатно</Button>
                ) : (
                  <Button onClick={() => setPayOpen(true)}>Купить · {formatMoney(course.price)}</Button>
                )}
              </>
            )}
            {user?.role === 'STUDENT' && enrolled && (
              <>
                <Button variant="secondary" disabled>
                  Доступ открыт
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/messages?courseId=${id}`)}
                >
                  Написать преподавателю
                </Button>
                <Button variant="secondary" onClick={() => setReviewsOpen(true)}>
                  Отзывы
                  {course._count?.reviews ? ` (${course._count.reviews})` : ''}
                </Button>
              </>
            )}
            {!(user?.role === 'STUDENT' && enrolled) && (
              <Button variant="secondary" onClick={() => setReviewsOpen(true)}>
                Отзывы
                {course._count?.reviews ? ` (${course._count.reviews})` : ''}
              </Button>
            )}
            {canManage && (
              <Button variant="secondary" onClick={() => void publish()}>
                {course.status === 'PUBLISHED' ? 'Снять с публикации' : 'Опубликовать'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {progress && (
        <Card className="mb-6 p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold tracking-tight">Прогресс курса</h2>
              <p className="text-sm text-kse-muted">Обновляется при переходе к следующему уроку</p>
            </div>
            <div className="font-display text-2xl font-bold text-brand-600">{progress.progressPercent}%</div>
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-kse-surface/80 px-3 py-2 dark:bg-border-dark/50">
              <div className="text-xs text-kse-muted">Завершено</div>
              <div className="text-lg font-semibold">{progress.completedLessons}</div>
            </div>
            <div className="rounded-xl bg-kse-surface/80 px-3 py-2 dark:bg-border-dark/50">
              <div className="text-xs text-kse-muted">Всего уроков</div>
              <div className="text-lg font-semibold">{progress.totalLessons}</div>
            </div>
            <div className="rounded-xl bg-kse-surface/80 px-3 py-2 dark:bg-border-dark/50">
              <div className="text-xs text-kse-muted">Активность</div>
              <div className="text-sm font-medium">
                {progress.lastActivityAt ? new Date(progress.lastActivityAt).toLocaleString('ru-RU') : '—'}
              </div>
            </div>
          </div>
          <ProgressBar value={progress.progressPercent} />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {contentLocked ? (
            <Card className="p-8 text-center">
              <h2 className="font-display text-xl font-bold text-ink dark:text-white">Курс закрыт</h2>
              <p className="mt-2 text-sm text-kse-muted">
                {isFree
                  ? 'Запишитесь на курс, чтобы открыть уроки, видео и материалы.'
                  : 'Купите курс, чтобы открыть уроки, видео и материалы.'}
              </p>
              <div className="mt-5">
                {isFree ? (
                  <Button onClick={() => void enroll()}>Записаться бесплатно</Button>
                ) : (
                  <Button onClick={() => setPayOpen(true)}>Купить · {formatMoney(price)}</Button>
                )}
              </div>
            </Card>
          ) : (
            selectedLesson && (
              <Card className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-kse-border px-5 py-4 dark:border-border-dark">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone="teal">{lessonTypeLabel(selectedLesson.contentType)}</Badge>
                      {completedSet.has(selectedLesson.id) && <Badge tone="green">Пройден</Badge>}
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
                      {selectedLesson.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManage && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEditLesson(selectedLesson)}>
                          Изменить
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => void deleteLesson(selectedLesson.id)}>
                          Удалить
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <LessonMedia
                    lesson={selectedLesson}
                    playlist={videoLessons}
                    onSelectLesson={goToLesson}
                    protect={user?.role === 'STUDENT'}
                  />
                </div>
                <div className="grid gap-2 border-t border-kse-border p-3 dark:border-border-dark sm:grid-cols-2 sm:p-4">
                  <button
                    type="button"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && goToLesson(prevLesson.id)}
                    className="flex min-h-16 items-center gap-3 rounded-2xl border border-kse-border bg-kse-surface/60 px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40 dark:border-border-dark dark:bg-border-dark/30 dark:hover:bg-brand-900/20"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-panel text-brand-600 dark:bg-panel-dark">
                      <ChevronLeft size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-kse-muted">
                        Предыдущий
                      </span>
                      <span className="block truncate text-sm font-semibold text-ink dark:text-white">
                        {prevLesson?.title ?? 'Это первый урок'}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && goToLesson(nextLesson.id)}
                    className="flex min-h-16 items-center justify-end gap-3 rounded-2xl border border-kse-border bg-kse-surface/60 px-3 py-2.5 text-right transition hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40 dark:border-border-dark dark:bg-border-dark/30 dark:hover:bg-brand-900/20"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-kse-muted">
                        Следующий
                      </span>
                      <span className="block truncate text-sm font-semibold text-ink dark:text-white">
                        {nextLesson?.title ?? 'Это последний урок'}
                      </span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                      <ChevronRight size={18} />
                    </span>
                  </button>
                </div>
              </Card>
            )
          )}
        </div>

        <div className="space-y-6">
          <CourseProgram
            modules={course.modules ?? []}
            selectedLessonId={selectedLesson?.id}
            contentLocked={contentLocked}
            completedSet={completedSet}
            canManage={canManage}
            onSelect={goToLesson}
            onEditLesson={startEditLesson}
            onEditModule={startEditModule}
            onDeleteModule={(m) => void deleteModule(m)}
          />

        {canManage && (
          <Card className="h-fit space-y-4 p-5">
            <h3 className="font-semibold tracking-tight">Управление программой</h3>
            <Input
              label={editingModuleId ? 'Название модуля' : 'Новый модуль'}
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />
            <Button className="w-full" onClick={() => void addModule()}>
              {editingModuleId ? 'Сохранить модуль' : 'Добавить модуль'}
            </Button>
            {editingModuleId && (
              <Button
                className="w-full"
                variant="ghost"
                type="button"
                onClick={() => {
                  setEditingModuleId(null);
                  setModuleTitle('');
                }}
              >
                Отмена
              </Button>
            )}

            <div className="border-t border-kse-border pt-4 dark:border-border-dark">
              <h4 className="mb-3 text-sm font-semibold">
                {editingLessonId ? 'Редактировать урок' : 'Новый урок'}
              </h4>
              <div className="space-y-3">
                <Input label="Название" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                <Select
                  label="Модуль"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  disabled={Boolean(editingLessonId)}
                >
                  {(course.modules ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Тип урока"
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                >
                  <option value="TEXT">Текст</option>
                  <option value="VIDEO">Видео</option>
                  <option value="IMAGE">Изображение</option>
                </Select>

                {lessonType === 'TEXT' && (
                  <Textarea
                    label="Текст урока"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                  />
                )}

                {(lessonType === 'VIDEO' || lessonType === 'IMAGE') && (
                  <>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-ink dark:text-brand-100">Источник</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            mediaSource === 'url'
                              ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30'
                              : 'border-kse-border text-kse-muted dark:border-border-dark'
                          }`}
                          onClick={() => {
                            setMediaSource('url');
                            setPendingFile(null);
                          }}
                        >
                          По URL
                        </button>
                        <button
                          type="button"
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            mediaSource === 'file'
                              ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30'
                              : 'border-kse-border text-kse-muted dark:border-border-dark'
                          }`}
                          onClick={() => {
                            setMediaSource('file');
                            if (!editingLessonId) setMediaUrl('');
                          }}
                        >
                          С компьютера
                        </button>
                      </div>
                    </div>

                    {mediaSource === 'url' ? (
                      <Input
                        label={lessonType === 'VIDEO' ? 'Ссылка на видео (YouTube / mp4)' : 'Ссылка на изображение'}
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder={lessonType === 'VIDEO' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                      />
                    ) : (
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-ink dark:text-brand-100">
                          {lessonType === 'VIDEO' ? 'Видеофайл' : 'Изображение'}
                        </span>
                        <input
                          type="file"
                          accept={
                            lessonType === 'VIDEO'
                              ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                              : 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
                          }
                          className="block w-full text-sm text-kse-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                          disabled={uploading || savingLesson}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setPendingFile(file);
                            setMediaUrl('');
                          }}
                        />
                        {pendingFile && (
                          <span className="block text-xs text-brand-600">
                            Выбран файл: {pendingFile.name} ({Math.round(pendingFile.size / 1024)} КБ)
                          </span>
                        )}
                      </label>
                    )}

                    <Textarea
                      label="Описание (необязательно)"
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                    />
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={uploading || savingLesson}
                    onClick={() => void saveLesson()}
                  >
                    {uploading
                      ? 'Загрузка файла…'
                      : savingLesson
                        ? 'Сохранение…'
                        : editingLessonId
                          ? 'Сохранить изменения'
                          : 'Добавить урок'}
                  </Button>
                  {editingLessonId && (
                    <Button className="w-full" variant="ghost" type="button" onClick={resetLessonForm}>
                      Отмена
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        </div>
      </div>

      {reviewsOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <button
            type="button"
            aria-label="Закрыть отзывы"
            className="absolute inset-0 bg-ink/30 transition-opacity"
            onClick={() => setReviewsOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="reviews-title"
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-kse-border bg-panel shadow-[-24px_0_48px_-28px_rgba(30,44,50,0.35)] dark:border-border-dark dark:bg-panel-dark"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-kse-border px-5 py-4 dark:border-border-dark">
              <div>
                <h2
                  id="reviews-title"
                  className="font-display text-lg font-extrabold tracking-tight text-ink dark:text-white"
                >
                  Отзывы
                </h2>
                <p className="mt-0.5 text-sm text-kse-muted dark:text-kse-gray">
                  <span className="text-amber-500">★</span> {Number(course.rating).toFixed(1)} ·{' '}
                  {reviews.length}{' '}
                  {reviews.length === 1
                    ? 'отзыв'
                    : reviews.length >= 2 && reviews.length <= 4
                      ? 'отзыва'
                      : 'отзывов'}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-kse-muted transition hover:bg-kse-surface hover:text-ink dark:hover:bg-border-dark/70 dark:hover:text-white"
                onClick={() => setReviewsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {canReview && (
                <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-900/30">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink dark:text-white">Оцените курс</span>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <Textarea
                    placeholder="Как вам курс? Что было полезно?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <div className="mt-3">
                    <Button size="sm" disabled={savingReview} onClick={() => void saveReview()}>
                      {savingReview ? 'Сохранение…' : 'Опубликовать отзыв'}
                    </Button>
                  </div>
                </div>
              )}

              {user?.role === 'STUDENT' && enrolled && !canReview && !myReview && (
                <p className="rounded-xl border border-kse-border bg-kse-surface/80 px-3.5 py-2.5 text-sm text-kse-muted dark:border-border-dark dark:bg-border-dark/40">
                  Пройдите все уроки, чтобы оставить оценку и комментарий.
                </p>
              )}

              {user?.role === 'STUDENT' && myReview && (
                <p className="rounded-xl border border-kse-border bg-kse-surface/80 px-3.5 py-2.5 text-sm text-kse-muted dark:border-border-dark dark:bg-border-dark/40">
                  Вы уже оставили отзыв по этому курсу.
                </p>
              )}

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Star className="text-kse-border dark:text-border-dark" size={28} />
                  <p className="text-sm text-kse-muted">Пока нет отзывов</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-2xl border border-kse-border bg-panel p-4 dark:border-border-dark dark:bg-panel-dark"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={fullName(review.user)}
                            src={review.user?.profile?.avatarUrl}
                            size="sm"
                          />
                          <div>
                            <div className="text-sm font-semibold text-ink dark:text-white">
                              {fullName(review.user)}
                            </div>
                            <div className="text-xs text-kse-muted">{formatDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <StarRating value={review.rating} readOnly />
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-kse-muted dark:text-kse-gray">
                        {review.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      <MockPaymentModal
        course={course}
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={() => {
          toast.success('Оплата прошла, доступ открыт');
          void load();
        }}
      />
    </div>
  );
}
