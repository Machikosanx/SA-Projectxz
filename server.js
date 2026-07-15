const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. เชื่อมต่อไปยังฐานข้อมูลใน XAMPP ที่คุณสร้างไว้ตอนแรก
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'WwLL58kUXUz7P9u.root',
    password: 'vGh8ACfYIHpOaIG1', // ค่าเริ่มต้นของ XAMPP จะเป็นค่าว่าง
    database: 'test', // ชื่อฐานข้อมูลที่คุณสร้างในหน้า phpMyAdmin
    ssl: {
        rejectUnauthorized: true
    }
});

db.connect((err) => {
    if (err) {
        console.error('เชื่อมต่อฐานข้อมูลล้มเหลว: ' + err.stack);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ! พร้อมรับพิกัด Speak Up แล้ว');
});

// 2. API สำหรับรับพิกัดแจ้งเหตุร้ายจากหน้าเว็บมาเก็บลงตาราง
app.post('/api/incidents', (req, res) => {
    const { hazard_type, description, latitude, longitude, risk_level } = req.body;
    const randomAlias = 'user_' + Math.floor(100000 + Math.random() * 900000); 
    
    const query = 'INSERT INTO incidents (user_alias, hazard_type, description, latitude, longitude, risk_level) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [randomAlias, hazard_type, description, latitude, longitude, risk_level], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'บันทึกจุดเสี่ยงเรียบร้อย!', id: result.insertId });
    });
});

// 3. API สำหรับดึงพิกัดทั้งหมดส่งกลับไปวาดจุดสีเหลือง/แดงบนแผนที่
app.get('/api/incidents', (req, res) => {
    db.query('SELECT * FROM incidents', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 เซิร์ฟเวอร์หลังบ้านออนไลน์เต็มรูปแบบ! พร้อมรับพิกัด Speak Up จากทุกเครื่องแล้ว");
});