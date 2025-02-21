import { prompts } from './gen_content';
export type { Prompt } from './types';

export async function loadPrompts() {
  return prompts;
}