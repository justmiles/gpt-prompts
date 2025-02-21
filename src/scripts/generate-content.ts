import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Prompt } from '../data/types';

function extractFirstParagraph(content: string): string {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  return lines[0]?.trim() || '';
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1] || 'Untitled Prompt';
}

function removeTitle(content: string): string {
  // Remove the first h1 title from the content if it exists
  return content.replace(/^#\s+.+\n/, '').trim();
}

async function generateContent() {
  const promptsDir = path.join(process.cwd(), 'prompts');
  const files = await fs.readdir(promptsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  const prompts: Prompt[] = await Promise.all(
    markdownFiles
      .sort()
      .map(async (file) => {
        const content = await fs.readFile(path.join(promptsDir, file), 'utf-8');
        const { data, content: markdown } = matter(content);
        
        // Get slug from filename without .md extension
        const slug = path.basename(file, '.md');
        
        // If title is not in frontmatter, extract it from content and remove it
        const title = data.title || extractTitle(markdown);
        const finalContent = data.title ? markdown : removeTitle(markdown);
        const description = data.description || extractFirstParagraph(finalContent);
        
        return {
          slug,
          title,
          category: data.category || 'Uncategorized',
          description,
          content: finalContent,
          author: data.author
        };
      })
  );

  const outputPath = path.join(process.cwd(), 'src', 'data', 'gen_content.ts');
  const content = `// This file is auto-generated. Do not edit!
export const prompts = ${JSON.stringify(prompts, null, 2)} as const;
`;

  await fs.writeFile(outputPath, content, 'utf-8');
  console.log('Generated content file successfully!');
}

generateContent().catch(console.error);