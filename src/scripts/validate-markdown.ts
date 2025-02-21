import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function validateMarkdown() {
  const promptsDir = path.join(process.cwd(), 'prompts');
  const files = await fs.readdir(promptsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  let hasErrors = false;

  for (const file of markdownFiles) {
    const filePath = path.join(promptsDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);
    const errors: string[] = [];

    // Required fields
    if (!data.title) errors.push('Missing title');
    if (!data.category) errors.push('Missing category');
    if (!data.description) errors.push('Missing description');

    // Author validation
    if (data.author) {
      const isLink = data.author.includes('[') && data.author.includes(']');
      if (isLink && !data.author.startsWith('[')) {
        errors.push('Author link must be wrapped in quotes and start with [');
      }
    }

    if (errors.length > 0) {
      console.error(`\nErrors in ${file}:`);
      errors.forEach(error => console.error(`  - ${error}`));
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('All markdown files validated successfully!');
  }
}

validateMarkdown().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});