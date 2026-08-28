const Skill = require('../models/Skill');

const DEFAULT_SKILLS = [
  // Technical Skills (20)
  { name: 'JavaScript', category: 'Technical', description: 'Core programming language for modern web development.' },
  { name: 'TypeScript', category: 'Technical', description: 'Typed superset of JavaScript that compiles to plain JavaScript.' },
  { name: 'Python', category: 'Technical', description: 'High-level versatile language for backend, data science, and scripting.' },
  { name: 'Java', category: 'Technical', description: 'Object-oriented programming language for robust enterprise backends.' },
  { name: 'C++', category: 'Technical', description: 'High-performance systems programming language.' },
  { name: 'React', category: 'Technical', description: 'Declarative component-driven frontend UI library.' },
  { name: 'Node.js', category: 'Technical', description: 'Asynchronous event-driven JavaScript backend runtime.' },
  { name: 'Express.js', category: 'Technical', description: 'Fast, unopinionated web framework for Node.js REST APIs.' },
  { name: 'MongoDB', category: 'Technical', description: 'NoSQL document database for modern scalable applications.' },
  { name: 'SQL', category: 'Technical', description: 'Structured Query Language for relational database management.' },
  { name: 'HTML', category: 'Technical', description: 'Standard markup language for web document structure.' },
  { name: 'CSS', category: 'Technical', description: 'Style sheet language for layout, responsive design, and styling.' },
  { name: 'Git & GitHub', category: 'Technical', description: 'Version control and distributed collaborative source code management.' },
  { name: 'REST API Development', category: 'Technical', description: 'Designing, building, and securing stateless HTTP web APIs.' },
  { name: 'Database Management', category: 'Technical', description: 'Designing, querying, indexing, and maintaining database systems.' },
  { name: 'Data Structures & Algorithms', category: 'Technical', description: 'Core computational problem solving and algorithmic efficiency.' },
  { name: 'Cloud Computing', category: 'Technical', description: 'Infrastructure provisioning, cloud services, and scalable deployment.' },
  { name: 'Cybersecurity', category: 'Technical', description: 'Protecting systems, networks, and applications from digital attacks.' },
  { name: 'UI/UX Design', category: 'Technical', description: 'User-centered interface design, usability principles, and prototyping.' },
  { name: 'Machine Learning', category: 'Technical', description: 'Developing predictive models and algorithms that learn from data.' },

  // Professional / Soft Skills (10)
  { name: 'Communication', category: 'Soft Skill', description: 'Clear, articulate verbal and written communication across teams.' },
  { name: 'Leadership', category: 'Soft Skill', description: 'Guiding, inspiring, and mentoring peers toward shared milestones.' },
  { name: 'Teamwork', category: 'Soft Skill', description: 'Collaborative cooperation and synergy within cross-functional teams.' },
  { name: 'Problem Solving', category: 'Soft Skill', description: 'Systematic root-cause identification and innovative resolution.' },
  { name: 'Critical Thinking', category: 'Soft Skill', description: 'Objective analysis and reasoned evaluation of complex scenarios.' },
  { name: 'Time Management', category: 'Soft Skill', description: 'Prioritizing deliverables and optimizing productivity under deadlines.' },
  { name: 'Project Management', category: 'Soft Skill', description: 'Planning, executing, and monitoring project milestones.' },
  { name: 'Presentation Skills', category: 'Soft Skill', description: 'Structuring and delivering engaging presentations to stakeholders.' },
  { name: 'Adaptability', category: 'Soft Skill', description: 'Embracing change and swiftly learning new domains and workflows.' },
  { name: 'Analytical Thinking', category: 'Soft Skill', description: 'Deconstructing complex problems into actionable components using data.' },
];

/**
 * Idempotently seed default skills into database.
 * Does not duplicate or delete existing manually-created skills.
 */
const seedSkills = async () => {
  try {
    let createdCount = 0;

    for (const skillData of DEFAULT_SKILLS) {
      const normalizedName = skillData.name.toLowerCase().trim();
      const existing = await Skill.findOne({ normalizedName });

      if (!existing) {
        await Skill.create({
          name: skillData.name,
          normalizedName,
          category: skillData.category,
          description: skillData.description,
          isActive: true,
        });
        createdCount += 1;
      }
    }

    if (createdCount > 0) {
      console.log(`✓ Seeded ${createdCount} new skills into the Skill Library.`);
    } else {
      console.log('✓ Skill Library is up to date (30 default skills verified).');
    }
  } catch (error) {
    console.error('Error seeding default skills:', error);
  }
};

module.exports = { seedSkills, DEFAULT_SKILLS };
