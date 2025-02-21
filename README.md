# GPT Prompt Library

A modern web application for discovering, sharing, and managing GPT prompts. Built with React, TypeScript, and Supabase.

![GPT Prompt Library Screenshot](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200&h=400)

## Features

- 🔍 Search and filter prompts by category
- 🌓 Dark/light mode support
- 👍 Upvote system for community curation
- 📝 Markdown support for rich prompt content
- 🔄 Sort by popularity or recency
- 📱 Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Supabase account

### Installation

#### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gpt-prompt-library.git
cd gpt-prompt-library
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

#### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker compose up -d
```

The application will be available at `http://localhost:8080`

2. Or build and run manually:
```bash
# Build the image
docker build -t gpt-prompt-library .

# Run the container
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  gpt-prompt-library
```

## Contributing

### Adding New Prompts

1. Create a new Markdown file in the `/prompts` directory
2. Include the required frontmatter:
```md
---
title: Your Prompt Title
category: Category Name
description: A brief description of your prompt
author: Your Name
---

Your prompt content here...
```

3. Submit a pull request with your changes

### Prompt File Structure

- Each prompt should be in its own `.md` file
- Filename should be kebab-case and match the intended URL slug
- Include clear instructions and examples
- Use markdown for formatting

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: React Router
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: React Markdown
- **Build Tool**: Vite
- **Deployment**: Docker, Nginx

## License

MIT License - See [LICENSE](LICENSE) for details

## Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Styling by [Tailwind CSS](https://tailwindcss.com)
- Database by [Supabase](https://supabase.com)