import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getLesson, getCurriculum, getAdjacentLessons } from '@/lib/lessons';
import LessonPageContent from './LessonPageContent';

interface LessonPageProps {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
}

/**
 * Generate static params for all lessons
 * Creates paths like /lesson/basics/01-introduction-to-returns
 */
export async function generateStaticParams() {
  const curriculum = getCurriculum();
  const params: { moduleId: string; lessonId: string }[] = [];

  for (const currModule of curriculum.modules) {
    for (const lesson of currModule.lessons) {
      // Extract lesson filename from slug (e.g., "basics/01-introduction" -> "01-introduction")
      const lessonId = lesson.slug.split('/').slice(1).join('/') || lesson.slug.split('/')[1];
      params.push({
        moduleId: currModule.id,
        lessonId: lessonId || lesson.slug.replace(`${currModule.id}/`, ''),
      });
    }
  }

  return params;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { moduleId, lessonId } = await params;
  const slug = `${moduleId}/${lessonId}`;
  const lesson = getLesson(slug);

  if (!lesson) {
    return {
      title: 'Lesson Not Found | QuantLearn',
    };
  }

  const curriculum = getCurriculum();
  const currModule = curriculum.modules.find(m => m.id === moduleId);

  return {
    title: `${lesson.frontmatter.title} | ${currModule?.name || moduleId} | QuantLearn`,
    description: `Learn about ${lesson.frontmatter.title} in QuantLearn's ${currModule?.name || moduleId} module. Interactive quantitative finance education with visualizations.`,
  };
}

/**
 * MDX Lesson Page Template
 *
 * This page renders lesson content with:
 * - Title and module context
 * - Embedded visualizations (via MDX components)
 * - Quiz integration
 * - Progress tracking
 * - Navigation between lessons
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;
  const slug = `${moduleId}/${lessonId}`;

  // Get lesson data
  const lesson = getLesson(slug);

  if (!lesson) {
    notFound();
  }

  // Get curriculum context
  const curriculum = getCurriculum();
  const currModule = curriculum.modules.find(m => m.id === moduleId);

  if (!currModule) {
    notFound();
  }

  // Get adjacent lessons for navigation
  const { prev, next } = getAdjacentLessons(slug);

  // Get all lesson slugs for unlock logic
  const allLessonSlugs = curriculum.modules.flatMap(m => m.lessons.map(l => l.slug));

  // Compile MDX content with math support
  const mdxSource = await serialize(lesson.content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    },
  });

  return (
    <LessonPageContent
      lesson={lesson}
      module={currModule}
      prevLesson={prev}
      nextLesson={next}
      allLessonSlugs={allLessonSlugs}
      mdxSource={mdxSource}
    />
  );
}
