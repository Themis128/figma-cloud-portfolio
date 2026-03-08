#!/usr/bin/env tsx
/**
 * Next.js Development Skills
 * Provides specialized skills for Next.js development workflows
 * 
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/skills/nextjs-development.ts
 */

import * as fs from "fs";
import * as path from "path";

interface Skill {
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  timestamp: string;
}

function createNextJsComponentSkill(): Skill {
  return {
    name: "nextjs-component-creation",
    description: "Create optimized Next.js components with TypeScript, Tailwind CSS, and proper structure",
    triggers: [
      "create component",
      "build component", 
      "add component",
      "new component"
    ],
    actions: [
      "Validate component naming conventions",
      "Generate TypeScript interfaces",
      "Create component with Tailwind classes",
      "Add proper exports to index files",
      "Generate component tests"
    ],
    timestamp: new Date().toISOString(),
  };
}

function createNextJsPageSkill(): Skill {
  return {
    name: "nextjs-page-creation",
    description: "Create Next.js pages with proper routing, SEO, and data fetching",
    triggers: [
      "create page",
      "add page",
      "new page",
      "route page"
    ],
    actions: [
      "Validate page naming and routing",
      "Generate page component with metadata",
      "Implement proper data fetching",
      "Add error handling and loading states",
      "Optimize for performance"
    ],
    timestamp: new Date().toISOString(),
  };
}

function createNextJsApiSkill(): Skill {
  return {
    name: "nextjs-api-creation",
    description: "Create Next.js API routes with proper validation, error handling, and security",
    triggers: [
      "create api",
      "add api",
      "new api",
      "api route"
    ],
    actions: [
      "Validate API route naming",
      "Implement input validation",
      "Add proper error handling",
      "Include security measures",
      "Generate API documentation"
    ],
    timestamp: new Date().toISOString(),
  };
}

function createNextJsOptimizationSkill(): Skill {
  return {
    name: "nextjs-optimization",
    description: "Optimize Next.js applications for performance, SEO, and user experience",
    triggers: [
      "optimize",
      "performance",
      "seo",
      "speed",
      "bundle size"
    ],
    actions: [
      "Analyze bundle size and dependencies",
      "Implement code splitting",
      "Optimize images and assets",
      "Review rendering strategies",
      "Check SEO best practices"
    ],
    timestamp: new Date().toISOString(),
  };
}

function createNextJsTestingSkill(): Skill {
  return {
    name: "nextjs-testing",
    description: "Set up and run comprehensive tests for Next.js applications",
    triggers: [
      "test",
      "testing",
      "jest",
      "playwright",
      "e2e"
    ],
    actions: [
      "Configure testing environment",
      "Create unit tests for components",
      "Set up integration tests",
      "Run E2E tests with Playwright",
      "Generate test coverage reports"
    ],
    timestamp: new Date().toISOString(),
  };
}

function logSkillUsage(skill: Skill, context: any): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "skills-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push({
    skill,
    context,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 200 skill usages
  if (logs.length > 200) {
    logs = logs.slice(-200);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

function generateSkillReport(skills: Skill[]): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `nextjs-skills-report-${Date.now()}.md`);

  const report = `# Next.js Development Skills Report

**Generated**: ${new Date().toISOString()}
**Total Skills**: ${skills.length}

## Available Skills

${skills.map((skill, index) => `
### ${index + 1}. ${skill.name}

**Description**: ${skill.description}

**Triggers**: ${skill.triggers.join(", ")}

**Actions**:
${skill.actions.map(action => `- ${action}`).join("\n")}

**Last Updated**: ${skill.timestamp}
`).join("")}

## Usage Guidelines

### Component Creation
- Use descriptive component names
- Follow TypeScript best practices
- Implement proper error boundaries
- Optimize for reusability

### Page Creation
- Use proper routing conventions
- Implement SEO metadata
- Handle loading and error states
- Optimize data fetching

### API Routes
- Validate all inputs
- Implement proper error handling
- Add security measures
- Document endpoints

### Performance Optimization
- Use code splitting
- Optimize images
- Implement caching strategies
- Monitor bundle size

### Testing
- Write comprehensive tests
- Use proper test patterns
- Run tests in CI/CD
- Monitor test coverage

## Best Practices

1. **TypeScript**: Always use TypeScript for type safety
2. **Tailwind CSS**: Use utility classes for styling
3. **Next.js Features**: Leverage built-in Next.js features
4. **Performance**: Optimize for Core Web Vitals
5. **SEO**: Implement proper metadata and structured data
6. **Accessibility**: Follow WCAG guidelines
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Next.js skills report saved to: ${reportFile}`);
}

async function main() {
  const command = process.argv[2] || "list";
  const skillName = process.argv[3];

  console.log("🚀 Cline Next.js Development Skills");
  console.log("==================================");

  const skills = [
    createNextJsComponentSkill(),
    createNextJsPageSkill(),
    createNextJsApiSkill(),
    createNextJsOptimizationSkill(),
    createNextJsTestingSkill(),
  ];

  switch (command) {
    case "list":
      console.log("📋 Available Next.js Skills:");
      skills.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill.name} - ${skill.description}`);
      });
      break;

    case "trigger":
      if (!skillName) {
        console.log("❌ Please specify a skill name");
        return;
      }

      const skill = skills.find(s => s.name === skillName);
      if (!skill) {
        console.log(`❌ Skill "${skillName}" not found`);
        return;
      }

      console.log(`🎯 Triggering skill: ${skill.name}`);
      console.log(`📝 Description: ${skill.description}`);
      console.log("🔧 Actions:");
      skill.actions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`);
      });

      // Log skill usage
      logSkillUsage(skill, { command, skillName });
      break;

    case "report":
      generateSkillReport(skills);
      break;

    default:
      console.log("❓ Available commands:");
      console.log("  list - List all available skills");
      console.log("  trigger <skill-name> - Trigger a specific skill");
      console.log("  report - Generate skills report");
  }
}

main().catch(console.error);