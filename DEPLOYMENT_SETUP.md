# GitHub CI/CD Deployment Setup Guide

This guide will help you set up automatic deployment to your DigitalOcean server using GitHub Actions.

## 🔧 Prerequisites

### On Your DigitalOcean Server

1. **Install Node.js and npm**:

   ```bash
   # Using NodeSource repository (recommended)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Verify installation
   node --version
   npm --version
   ```

2. **Install Git**:

   ```bash
   sudo apt update
   sudo apt install git -y
   ```

3. **Create a dedicated directory for your project** (optional but recommended):

   ```bash
   mkdir -p /home/yourusername/projects
   ```

4. **Install a web server** (if not already installed):

   ```bash
   # For Nginx
   sudo apt install nginx -y
   sudo systemctl start nginx
   sudo systemctl enable nginx

   # For Apache
   sudo apt install apache2 -y
   sudo systemctl start apache2
   sudo systemctl enable apache2
   ```

## 🔐 GitHub Secrets Configuration

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add the following secrets:

### Required Secrets

| Secret Name | Description                         | Example                  |
| ----------- | ----------------------------------- | ------------------------ |
| `HOST`      | Your DigitalOcean server IP address | `142.93.123.456`         |
| `USERNAME`  | SSH username for your server        | `root` or `yourusername` |
| `PASSWORD`  | SSH password for your server        | Your server password     |
| `PORT`      | SSH port (optional, defaults to 22) | `22`                     |

### Security Note

⚠️ **For production environments**, it's recommended to use SSH keys instead of passwords. If you want to use SSH keys:

1. Generate an SSH key pair on your local machine:

   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key
   ```

2. Copy the public key to your server:

   ```bash
   ssh-copy-id -i ~/.ssh/deploy_key.pub username@your-server-ip
   ```

3. In GitHub secrets, replace `PASSWORD` with:

   - `SSH_KEY`: The content of your private key (`~/.ssh/deploy_key`)

4. Update the workflow file to use SSH key instead of password.

## 📁 Server Directory Structure

The deployment script will create the following structure on your server:

```
/home/yourusername/
└── edvara-fe/                 # Your project directory
    ├── src/                   # Source files
    ├── dist/                  # Built files (created after npm run build)
    ├── package.json
    └── ...                    # Other project files
```

## 🌐 Web Server Configuration

### For Nginx

1. Create a new site configuration:

   ```bash
   sudo nano /etc/nginx/sites-available/edvara-fe
   ```

2. Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain or use server IP

       root /home/yourusername/edvara-fe/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Optional: Add gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/edvara-fe /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

### For Apache

1. Create a new virtual host:

   ```bash
   sudo nano /etc/apache2/sites-available/edvara-fe.conf
   ```

2. Add the following configuration:

   ```apache
   <VirtualHost *:80>
       DocumentRoot /home/yourusername/edvara-fe/dist
       ServerName your-domain.com  # Replace with your domain

       <Directory /home/yourusername/edvara-fe/dist>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted

           # Handle React Router
           FallbackResource /index.html
       </Directory>
   </VirtualHost>
   ```

3. Enable the site:
   ```bash
   sudo a2ensite edvara-fe.conf
   sudo systemctl reload apache2
   ```

## 🚀 Deployment Process

Once configured, the deployment will automatically trigger when you:

1. **Push to main branch**: `git push origin main`
2. **Manually trigger**: Go to Actions tab → Deploy to DigitalOcean → Run workflow

### What happens during deployment:

1. 🔄 Connects to your server via SSH
2. 📥 Clones/pulls the latest code from GitHub
3. 📦 Installs dependencies with `npm ci`
4. 🔨 Builds the project with `npm run build`
5. ✅ Verifies the build was successful

## 🔧 Customization

### Update Project Path

If you want to deploy to a different directory, edit the workflow file (`.github/workflows/deploy.yml`):

```yaml
PROJECT_PATH="/your/custom/path/edvara-fe"
```

### Auto-deploy to Web Server

Uncomment and modify these lines in the workflow to automatically copy files to your web server:

```bash
# Copy build files to web server directory
echo "🚀 Copying files to web server..."
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/

# Restart web server
sudo systemctl restart nginx
```

### Environment Variables

If your project needs environment variables, you can:

1. Add them as GitHub secrets
2. Create a `.env` file on your server
3. Use them in the deployment script:

```bash
# In the deployment script
echo "VITE_API_URL=${{ secrets.VITE_API_URL }}" > .env.production
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission denied**: Make sure your user has proper permissions

   ```bash
   sudo chown -R yourusername:yourusername /home/yourusername/edvara-fe
   ```

2. **Node.js not found**: Ensure Node.js is installed and in PATH

   ```bash
   which node
   node --version
   ```

3. **Build fails**: Check if all dependencies are available

   ```bash
   cd /home/yourusername/edvara-fe
   npm install
   npm run build
   ```

4. **Git authentication**: If using a private repository, you may need to set up GitHub credentials on your server

### Viewing Logs

- GitHub Actions logs: Go to Actions tab in your repository
- Server logs: Check the deployment output in GitHub Actions
- Web server logs:
  - Nginx: `sudo tail -f /var/log/nginx/error.log`
  - Apache: `sudo tail -f /var/log/apache2/error.log`

## 🔒 Security Best Practices

1. **Use SSH keys instead of passwords**
2. **Create a dedicated deployment user** with limited permissions
3. **Use environment variables** for sensitive configuration
4. **Enable firewall** and limit SSH access
5. **Keep your server updated**: `sudo apt update && sudo apt upgrade`

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test SSH connection manually: `ssh username@your-server-ip`
4. Ensure your server meets all prerequisites

---

🎉 **That's it!** Your project will now automatically deploy to your DigitalOcean server whenever you push to the main branch.
