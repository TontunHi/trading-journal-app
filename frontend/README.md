# 📈 Trading Journal Web Application

> **"Master Your Trading Discipline"** – เครื่องมือจดบันทึกการเทรดสำหรับมืออาชีพ เปลี่ยนการพนันให้เป็นการลงทุนด้วยระบบและวินัย

![Project Status](https://img.shields.io/badge/Status-Development-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20MySQL-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📖 เกี่ยวกับโปรเจกต์ (About)

**Trading Journal** คือเว็บแอปพลิเคชันที่พัฒนาขึ้นเพื่อตอบโจทย์เทรดเดอร์สาย **SMC (Smart Money Concepts)** และ **ICT** โดยเฉพาะ เน้นการจดบันทึกที่ละเอียด ครอบคลุมทั้งด้านเทคนิค (Technical), จิตวิทยา (Psychology), และการบริหารหน้าตัก (Money Management)

ตัวเว็บออกแบบด้วยดีไซน์ **Dark Mode Minimalism** เพื่อถนอมสายตาและให้ความสำคัญกับข้อมูลเป็นหลัก ช่วยให้เทรดเดอร์สามารถ Review ผลงานและพัฒนาวินัยได้อย่างต่อเนื่อง

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 📊 Dashboard & Analytics
- **Performance Overview:** แสดง Win Rate, Total Trades และ Net P/L แบบ Real-time
- **Status Indicators:** แยกสถานะออเดอร์ชัดเจน (Open, Closed Profit, Closed Loss, Break Even)
- **Visual Stats:** กราฟและตัวเลขสรุปผลที่ดูง่าย สบายตา

### 📝 Professional Journaling (TKT SMC System)
- **SMC Checklist:** ระบบตรวจสอบเงื่อนไขก่อนเข้าเทรด (Structure, Kill Zone, Liquidity Sweep, PD Zone, Key Levels)
- **Detailed Log:** บันทึก Timeframe, Session (Asia/London/NY), Pair, และเหตุผลในการเข้าเทรด
- **Image Evidence:** รองรับการอัปโหลดรูปภาพกราฟ "ก่อนเข้า" (Before) และ "หลังจบ" (After) เพื่อเปรียบเทียบแผนกับผลลัพธ์

### 📅 Hybrid Calendar View
- **Daily Performance:** ปฏิทินแสดงผลกำไร/ขาดทุนรายวัน (สีเขียว/แดง)
- **Cashflow Tracking:** แสดงยอด **ฝาก (Deposit)** และ **ถอน (Withdraw)** ในปฏิทินร่วมกับผลเทรด
- **Auto Conversion:** ระบบแปลงหน่วยเงิน USC (Cent) เป็น USD อัตโนมัติ เพื่อการคำนวณยอดรวมที่ถูกต้อง

### 💰 Quick Balance Manager
- **Manual Ledger:** บันทึกรายการฝาก, ถอน, หรือกำไร/ขาดทุนพิเศษนอกเหนือจากการเทรด
- **Currency Toggle:** สลับหน่วยเงิน USD/USC ได้ทันที
- **Smart Date:** ระบบเลือกวันที่ย้อนหลังแบบรวดเร็ว (Yesterday/Today)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework:** [Next.js 14+] (App Router)
- **Styling:** [Tailwind CSS] (Custom Dark Theme)
- **Icons:** [Lucide React]
- **Utilities:** Axios, SweetAlert2, Date-fns

### Backend
- **Runtime:** [Node.js]
- **Framework:** [Express.js] (MVC Pattern)
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer (Image Uploads)

### Database
- **Database:** [MySQL]
- **Driver:** mysql2 (Connection Pooling)

---

## 🚀 การติดตั้งและใช้งาน (Installation)

### 1. สิ่งที่ต้องมี (Prerequisites)
- Node.js (v18 ขึ้นไป)
- MySQL Server (เช่น XAMPP, MAMP, หรือ MySQL Installer)

### 2. ตั้งค่าฐานข้อมูล (Database Setup)
สร้าง Database ชื่อ `trading_journal_db` และรันคำสั่ง SQL ต่อไปนี้เพื่อสร้างตาราง:

```sql
CREATE DATABASE IF NOT EXISTS trading_journal_db;
USE trading_journal_db;

-- 1. ตาราง Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตาราง Trading Logs
CREATE TABLE trading_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pair VARCHAR(20) DEFAULT 'XAUUSD',
    session VARCHAR(20),
    order_type VARCHAR(20),
    timeframe VARCHAR(10),
    bias_trend VARCHAR(20),
    entry_price DECIMAL(10,3),
    sl_price DECIMAL(10,3),
    tp_price DECIMAL(10,3),
    lot_size DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'OPEN',
    exit_price DECIMAL(10,3),
    p_l_amount DECIMAL(10,2),
    p_l_percent DECIMAL(5,2),
    entry_date DATETIME,
    exit_date DATETIME,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ตาราง Checklists (SMC System)
CREATE TABLE trade_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    is_structure_valid BOOLEAN DEFAULT 0,
    is_bias_correct BOOLEAN DEFAULT 0,
    is_kill_zone BOOLEAN DEFAULT 0,
    is_liquidity_sweep BOOLEAN DEFAULT 0,
    is_volume_spike BOOLEAN DEFAULT 0,
    pd_zone VARCHAR(20) DEFAULT 'NONE',
    key_level_type VARCHAR(20) DEFAULT 'NONE',
    pa_pattern VARCHAR(20) DEFAULT 'NONE',
    FOREIGN KEY (log_id) REFERENCES trading_logs(id) ON DELETE CASCADE
);

-- 4. ตาราง Images
CREATE TABLE trade_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    image_type VARCHAR(10), -- 'BEFORE', 'AFTER'
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES trading_logs(id) ON DELETE CASCADE
);

-- 5. ตาราง Balance Logs (ฝาก/ถอน/ปรับยอด)
CREATE TABLE balance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAW', 'PROFIT', 'LOSS') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency ENUM('USD', 'USC') NOT NULL DEFAULT 'USD',
    log_date DATETIME NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);