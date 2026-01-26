# Deployment Guide for Ubuntu (No Domain)

This guide will walk you through deploying the TradeJournal application on an Ubuntu server using its IP address.

## Prerequisites

- An Ubuntu Server (20.04 or 22.04 LTS recommended)
- Root (sudo) access
- The server's public IP address (referred to as `YOUR_SERVER_IP` in this guide)

## 1. System Update & Dependencies

Connect to your server via SSH:

```bash
ssh root@172.16.0.10
```

Update packages and install necessary tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip build-essential
```

## 2. Install Node.js (v20 LTS recommended)

Using NVM (Node Version Manager) is best for managing Node versions.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v # Should verify v20.x.x
npm -v
```

## 3. Install MySQL Database

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Secure the installation (Set root password when prompted):

```bash
sudo mysql_secure_installation
```

Log in to MySQL and create the database and user:

```bash
sudo mysql -u root -p
```

Inside the MySQL shell:

```sql
CREATE DATABASE trading_journal;
-- Replace 'your_password' with a strong password
CREATE USER 'trader'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON trading_journal.* TO 'trader'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.1. Importing Existing Data (Optional)

If you have a `.sql` backup file (structure and data) from Navicat, follow these steps to import it:

#### Option A: Command Line (Recommended)

1. **Upload the file to your server**:
   From your local computer (where the `.sql` file is), run:

   ```bash
   # Replace /path/to/backup.sql with your actual file path
   scp /path/to/backup.sql root@172.16.0.10:/root/backup.sql
   ```

2. **Import the file**:
   On your Ubuntu server:
   ```bash
   mysql -u trader -p trading_journal < /root/backup.sql
   ```
   _Enter the password you created for the 'trader' user when prompted._

#### Option B: Direct Connection via Navicat (SSH Tunnel)

1. In Navicat, create a new MySQL connection.
2. **General Tab**:
   - Host: `localhost` (Important: use localhost)
   - Port: `3306`
   - User: `trader`
   - Password: `your_password`
3. **SSH Tab**:
   - Check **Use SSH Tunnel**.
   - Host: `172.16.0.10`
   - Port: `22`
   - User: `root` (or your SSH user)
   - Authentication: Password or Private Key.
4. Once connected, you can right-click the database and use **Execute SQL File...** to import your data.

## 4. Install PM2 (Process Manager)

PM2 keeps your app running in the background.

```bash
npm install -g pm2
```

## 5. Clone the Repository

```bash
cd /var/www
sudo mkdir tradejournal
sudo chown -R $USER:$USER tradejournal
cd tradejournal
git clone https://github.com/TontunHi/trading-journal-app.git .
```

## 6. Backend Setup

Navigate to backend:

```bash
cd backend
npm install
```

Create `.env` file:

```bash
nano .env
```

Paste the following (Adjusting password):

```env
PORT=5000
DATABASE_URL="mysql://trader:your_password@localhost:3306/trading_journal"
JWT_SECRET="your_super_secret_jwt_key_here"
```

Save with `Ctrl+X`, `Y`, `Enter`.

Run Database Migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start Backend with PM2:

```bash
pm2 start app.js --name "trade-backend"
```

_Note: If you imported the database structure from a `.sql` file in step 3.1, you might skip `prisma migrate deploy` but still need `prisma generate`._

## 7. Frontend Setup

Navigate to frontend:

```bash
cd ../frontend
npm install
```

Create `.env` file (Use your Server IP here):

```bash
nano .env
```

Paste this:

```env
NEXT_PUBLIC_API_URL="http://172.16.0.10/api"
```

_Note: Since we will proxy via Nginx later, using just `/api` might be cleaner, but putting the full IP ensures connectivity._

Build the Next.js app:

```bash
npm run build
```

Start Frontend with PM2:

```bash
pm2 start npm --name "trade-frontend" -- start -- -p 3000
```

Save PM2 list so it restarts on boot:

```bash
pm2 save
pm2 startup
# Run the command PM2 outputs to freeze the process list
```

## 8. Configure Nginx (Reverse Proxy)

Install Nginx:

```bash
sudo apt install -y nginx
```

Create a new config:

```bash
sudo nano /etc/nginx/sites-available/tradejournal
```

Paste the following configuration (Replace `YOUR_SERVER_IP`):

```nginx
server {
    listen 80;
    server_name 172.16.0.10; # e.g. 192.168.1.10

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        # Rewrite /api/xxx to /api/xxx (or just pass through if backend expects /api)
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend Images/Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tradejournal /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t # Test config
sudo systemctl restart nginx
```

## 9. Firewall (UFW)

Ensure port 80 is open:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Done!

Visit `http://YOUR_SERVER_IP` in your browser. Your app should be live.
