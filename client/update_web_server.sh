#!/bin/bash
set -e  # stop if any command fails

git pull
npm run build
sudo rsync -a --delete dist/ /var/www/calculator/

# Create the symlink only if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/calculator ]; then
  sudo ln -s /etc/nginx/sites-available/calculator /etc/nginx/sites-enabled/
else
  echo "Symlink /etc/nginx/sites-enabled/calculator already exists — skipping."
fi

sudo nginx -t
sudo systemctl reload nginx

