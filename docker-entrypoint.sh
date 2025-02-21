#!/bin/sh

# Replace environment variables in the HTML file
sed -i "s|%VITE_SUPABASE_URL%|$VITE_SUPABASE_URL|g" /usr/share/nginx/html/index.html
sed -i "s|%VITE_SUPABASE_ANON_KEY%|$VITE_SUPABASE_ANON_KEY|g" /usr/share/nginx/html/index.html

# Execute the main container command
exec "$@"