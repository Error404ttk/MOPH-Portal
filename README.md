# MOPH Portal Dashboard

<div align="center">
  <p>MOPH Portal Dashboard เป็นเว็บแอปพลิเคชันที่ทำหน้าที่เป็น ศูนย์กลางรวบรวมลิงก์ (Centralized Portal)</p>
  <p>A comprehensive dashboard for MOPH (Ministry of Public Health) services and information.</p>
</div>

## ฟีเจอร์หลัก / Features

- จัดหมวดหมู่ลิงก์เป็นระเบียบ / Category-based link organization
- ออกแบบให้รองรับทุกอุปกรณ์ / Responsive design
- ระบบจัดการเนื้อหาสำหรับผู้ดูแลระบบ / Admin interface for content management
- สร้าง QR Code สำหรับเข้าถึงลิงก์อย่างรวดเร็ว / QR code generation for quick access

## เริ่มต้นใช้งาน / Getting Started

### สิ่งที่ต้องมี / Prerequisites
- Node.js (v14 ขึ้นไป / v14 or later)
- npm หรือ yarn

### การติดตั้ง / Installation

1. โคลนโปรเจค:
   ```bash
   git clone https://github.com/Error404ttk/MOPH-Portal.git
   cd MOPH-Portal
   ```

2. ติดตั้งแพ็คเกจที่จำเป็น:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. ตั้งค่าตัวแปรสภาพแวดล้อม:
   - สร้างไฟล์ `.env` ในโฟลเดอร์หลัก
   - กำหนดค่าต่างๆ ตามที่ระบบต้องการ

4. เริ่มต้นการทำงาน:
   ```bash
   # เริ่ม Frontend
   npm run dev

   # เปิด Terminal ใหม่ สำหรับ Backend
   cd server
   npm start
   ```

## การติดตั้งสำหรับใช้งานจริง / Deployment

สำหรับการติดตั้งในระบบจริง กรุณาอ่านคู่มือการติดตั้งในโฟลเดอร์ `docs`

## สัญญาอนุญาต / License

โปรเจคนี้ใช้สัญญาอนุญาต MIT - ดูรายละเอียดได้ที่ [LICENSE](LICENSE)

---

<div align="center">
  <p>พัฒนาโดย ❤️ สำหรับ กระทรวงสาธารณสุข</p>
  <p>Developed with ❤️ for MOPH</p>
</div>
