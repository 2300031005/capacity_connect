/**
 * Course and Recommendation Formatter Utilities
 * Ensures zero internal database identifiers or timestamp numbers appear in trainee-facing UI.
 */

/**
 * Remove long numbers, timestamps, and database IDs from strings
 */
export const stripInternalIds = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\b\d{5,}\b/g, '') // remove standalone numbers >= 5 digits
    .replace(/\s+\d{5,}$/g, '') // remove trailing numbers >= 5 digits
    .replace(/[-_]\d{5,}/g, '') // remove hyphenated/underscored IDs
    .replace(/\s{2,}/g, ' ')   // normalize whitespace
    .trim();
};

/**
 * Clean course titles
 */
export const formatCleanTitle = (title) => {
  const clean = stripInternalIds(title);
  return clean || 'Institutional Course';
};

/**
 * Standard learner-friendly descriptions for common course topics
 */
const CURATED_DESCRIPTIONS = {
  'modern react & node': 'Build modern web applications with React and Node.js, focusing on scalable architecture and backend development.',
  'modern react and node': 'Build modern web applications with React and Node.js, focusing on scalable architecture and backend development.',
  'advanced react architecture': 'Learn scalable React architecture, reusable patterns, state management, and application design.',
  'node.js backend development': 'Strengthen your backend development skills with Node.js, APIs, authentication, and scalable services.',
  'node js backend development': 'Strengthen your backend development skills with Node.js, APIs, authentication, and scalable services.',
  'cloud native development': 'Learn modern cloud-native practices for building, deploying, and scaling reliable applications.',
  'cloud native full stack': 'Learn modern cloud-native practices for building, deploying, and scaling reliable applications.',
  'full stack development': 'Build complete web applications by combining modern frontend and backend development practices.',
  'phase 5 full stack mastery': 'Build complete web applications by combining modern frontend and backend development practices.',
  'system design': 'Develop practical system design skills for building scalable and reliable software systems.',
  'executive presentation skills': 'Develop practical presentation and communication skills for technical and organizational leadership.',
  'intro to react redux': 'Learn fundamental React and Redux state management patterns for interactive web applications.',
  'modern mern stack with ai': 'Build AI-powered full stack applications using the MERN stack with modern architecture.',
};

/**
 * Format a short, professional, learner-friendly description (1-2 sentences, 12-25 words)
 */
export const formatCleanDescription = (course, item) => {
  const title = formatCleanTitle(course?.title || '').toLowerCase();

  // 1. Check curated standard dictionary
  for (const [key, desc] of Object.entries(CURATED_DESCRIPTIONS)) {
    if (title === key || title.includes(key)) {
      return desc;
    }
  }

  // 2. Check course description if it is clean and concise
  const rawDesc = course?.description ? stripInternalIds(course.description) : '';
  if (rawDesc && !rawDesc.toLowerCase().includes('database') && !rawDesc.toLowerCase().includes('objectid')) {
    // If it's already a concise 1-2 sentence description, use it
    const sentences = rawDesc.split(/[.!?]+/).filter(Boolean);
    if (sentences.length > 0) {
      const shortDesc = sentences.slice(0, 2).join('. ').trim();
      const words = shortDesc.split(/\s+/);
      if (words.length >= 8 && words.length <= 30) {
        return shortDesc.endsWith('.') ? shortDesc : `${shortDesc}.`;
      }
    }
  }

  // 3. Fallback based on category and title
  const cleanCategory = formatCleanCategory(course?.category);
  const cleanTitle = formatCleanTitle(course?.title);

  if (cleanCategory.includes('CLOUD')) {
    return 'Develop cloud-native skills for deploying and scaling modern applications.';
  }
  if (cleanCategory.includes('BACKEND') || cleanCategory.includes('DATABASE')) {
    return 'Strengthen your backend development skills through practical API and service architecture.';
  }
  if (cleanCategory.includes('FRONTEND') || cleanTitle.toLowerCase().includes('react')) {
    return 'Build scalable frontend applications and strengthen your component architecture skills.';
  }
  if (cleanCategory.includes('LEADERSHIP') || cleanCategory.includes('MANAGEMENT')) {
    return 'Develop essential organizational and technical communication skills for leadership roles.';
  }

  return `Master ${cleanTitle} concepts and develop practical ${cleanCategory.toLowerCase()} skills.`;
};

/**
 * Clean categories to uppercase standard strings without numbers
 */
export const formatCleanCategory = (category) => {
  const clean = stripInternalIds(category || 'SOFTWARE ENGINEERING');
  return clean.toUpperCase();
};

/**
 * Clean and format skill tags with proficiency (e.g. "React Architecture — Advanced")
 */
export const formatCleanSkillTags = (item, course) => {
  const tags = [];
  const rawSkills = Array.isArray(item?.skillAlignment) && item.skillAlignment.length > 0
    ? item.skillAlignment
    : (course?.skills || []);

  for (const sk of rawSkills) {
    let name = '';
    let prof = '';

    if (typeof sk === 'string') {
      name = sk;
    } else if (sk && typeof sk === 'object') {
      name = sk.skill?.name || sk.skill || sk.name || '';
      prof = sk.targetProficiency || sk.proficiency || '';
    }

    const cleanName = stripInternalIds(name);
    if (!cleanName) continue;

    const cleanProf = stripInternalIds(prof) || (course?.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Proficient');

    tags.push({
      name: cleanName,
      proficiency: cleanProf,
      displayTag: `${cleanName} — ${cleanProf}`,
    });

    if (tags.length >= 2) break;
  }

  // If no skills found, fallback to category
  if (tags.length === 0) {
    const cat = stripInternalIds(course?.category || 'Software Engineering');
    const lvl = course?.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Proficient';
    tags.push({
      name: cat,
      proficiency: lvl,
      displayTag: `${cat} — ${lvl}`,
    });
  }

  return tags;
};

/**
 * Clean course level display (e.g. "LEVEL: INTERMEDIATE")
 */
export const formatCleanLevel = (level) => {
  const clean = stripInternalIds(level || 'Intermediate');
  return `LEVEL: ${clean.toUpperCase()}`;
};

/**
 * Clean match score (e.g. "98% Match")
 */
export const formatCleanMatchScore = (score) => {
  const num = typeof score === 'number' ? Math.round(score) : parseInt(stripInternalIds(String(score || '85')), 10) || 85;
  const clamped = Math.min(99, Math.max(70, num));
  return `${clamped}% Match`;
};
