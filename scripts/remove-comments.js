import fs from 'fs';
import path from 'path';

const directories = ['src', 'app', 'scripts'];

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

const preservePatterns = [
  /^\/\*\*.*\*\//s, // JSDoc comments
  /^\/\*\*[\s\S]*?\*\//m, // Multi-line JSDoc
  /^\s*\/\*\*[\s\S]*?\*\//m, // Indented JSDoc
  /^\/\* eslint-disable/m, // ESLint disable comments
  /^\/\/ eslint-disable/m, // ESLint disable comments
  /^\/\* @ts-/m, // TypeScript compiler directives
  /^\/\/ @ts-/m, // TypeScript compiler directives
  /@deprecated/i, // Deprecation comments
];

function shouldPreserveComment(comment) {
  return preservePatterns.some(pattern => pattern.test(comment));
}

function removeComments(content) {

  content = content.replace(/^[ \t]*\/\/.*$/gm, '');

  content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    if (shouldPreserveComment(match)) {
      return match;
    }
    return '';
  });

  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  content = content.replace(/[ \t]+$/gm, '');

  return content;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleanedContent = removeComments(content);

  if (content !== cleanedContent) {
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, skipping...`);
    return;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory() && !item.name.startsWith('.')) {
      processDirectory(fullPath);
    } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
      processFile(fullPath);
    }
  }
}

console.log('Starting comment removal...');

directories.forEach(dir => {
  console.log(`\nProcessing directory: ${dir}`);
  processDirectory(dir);
});

console.log('\nComment removal complete!');