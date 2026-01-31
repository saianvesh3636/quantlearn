import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Lesson, LessonFrontmatter, Module, Curriculum } from './types';

const LESSONS_DIR = path.join(process.cwd(), 'content/lessons');

/**
 * Module display name mapping
 */
const MODULE_NAMES: Record<string, string> = {
  basics: 'Math Foundations',
  trading: 'Core Trading Concepts',
  backtesting: 'Backtesting & Scientific Method',
  strategies: 'Strategy Types',
  advanced: 'Advanced Quant Techniques',
  production: 'Production Skills',
};

/**
 * Parse a single MDX file and extract frontmatter + content
 */
function parseLessonFile(filePath: string, module: string): Lesson | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const frontmatter = data as LessonFrontmatter;

    // Validate required frontmatter
    if (!frontmatter.title || !frontmatter.module || frontmatter.order === undefined) {
      console.warn(`Invalid frontmatter in ${filePath}`);
      return null;
    }

    const filename = path.basename(filePath, '.mdx');
    const slug = `${module}/${filename}`;

    return {
      slug,
      module,
      frontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error parsing lesson file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all lessons from a module directory
 */
function getLessonsFromModule(moduleDir: string, moduleName: string): Lesson[] {
  const lessons: Lesson[] = [];

  try {
    const files = fs.readdirSync(moduleDir);

    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;

      const filePath = path.join(moduleDir, file);
      const lesson = parseLessonFile(filePath, moduleName);

      if (lesson) {
        lessons.push(lesson);
      }
    }
  } catch (error) {
    // Directory might not exist yet
    console.debug(`Module directory ${moduleDir} not found or empty`);
  }

  // Sort by order
  return lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

/**
 * Build the full curriculum tree from MDX files
 */
export function getCurriculum(): Curriculum {
  const modules: Module[] = [];

  try {
    // Check if lessons directory exists
    if (!fs.existsSync(LESSONS_DIR)) {
      return { modules: [] };
    }

    const moduleDirs = fs.readdirSync(LESSONS_DIR);

    for (const dir of moduleDirs) {
      // Skip hidden files and non-directories
      if (dir.startsWith('.')) continue;

      const modulePath = path.join(LESSONS_DIR, dir);
      const stat = fs.statSync(modulePath);

      if (!stat.isDirectory()) continue;

      const lessons = getLessonsFromModule(modulePath, dir);

      if (lessons.length > 0) {
        modules.push({
          id: dir,
          name: MODULE_NAMES[dir] || dir.charAt(0).toUpperCase() + dir.slice(1),
          lessons,
        });
      }
    }
  } catch (error) {
    console.error('Error loading curriculum:', error);
  }

  // Sort modules by a predefined order
  const moduleOrder = ['basics', 'trading', 'backtesting', 'strategies', 'advanced', 'production'];
  modules.sort((a, b) => {
    const aIndex = moduleOrder.indexOf(a.id);
    const bIndex = moduleOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.id.localeCompare(b.id);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return { modules };
}

/**
 * Get a single lesson by slug
 */
export function getLesson(slug: string): Lesson | null {
  const [module, ...rest] = slug.split('/');
  const filename = rest.join('/');
  const filePath = path.join(LESSONS_DIR, module, `${filename}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parseLessonFile(filePath, module);
}

/**
 * Get all lesson slugs for static generation
 */
export function getAllLessonSlugs(): string[] {
  const curriculum = getCurriculum();
  return curriculum.modules.flatMap(m => m.lessons.map(l => l.slug));
}

/**
 * Get next and previous lessons for navigation
 */
export function getAdjacentLessons(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const curriculum = getCurriculum();
  const allLessons = curriculum.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
  };
}
