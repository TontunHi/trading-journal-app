module.exports = {
    apps: [
        {
            name: "trading-backend",
            cwd: "./backend",
            script: "src/app.js",
            env: {
                NODE_ENV: "production",
                // PORT: 5000 // สามารถกำหนดตรงนี้ได้ หรือใช้ไฟล์ .env ในโฟลเดอร์ backend
            }
        },
        {
            name: "trading-frontend",
            cwd: "./frontend",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3001 // เปลี่ยน Port ตรงนี้ถ้า 3000 ไม่ว่าง
            }
        }
    ]
};
