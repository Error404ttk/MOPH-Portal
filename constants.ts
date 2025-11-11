import { LinkCategory, FooterData, User, DatabaseConfig } from './types';

export const MOPH_DATA: LinkCategory[] = [
  {
    title: "รวมเว็บไซต์กระทรวงสาธารณสุข | MOPH",
    description: "บริการอิเล็กทรอนิกส์และระบบสารสนเทศหลักของกระทรวงฯ",
    links: [
      { name: "MOPH PHR Viewer", url: "#", icon: "FileClock", description: "ระบบดูข้อมูลสุขภาพส่วนบุคคล" },
      { name: "Account Center", url: "#", icon: "UserCog", description: "ศูนย์จัดการบัญชีผู้ใช้งาน" },
      { name: "IDP Admin", url: "#", icon: "ShieldCheck", description: "ผู้ดูแลระบบยืนยันตัวตน" },
      { name: "PHR Dashboard", url: "#", icon: "LayoutDashboard", description: "แดชบอร์ดข้อมูลสุขภาพ" },
      { name: "CVP1 Dashboard", url: "#", icon: "BarChart2", description: "ติดตามข้อมูล CVP1" },
      { name: "MOPH Claim", url: "#", icon: "Receipt", description: "ระบบเรียกร้องค่าใช้จ่าย" },
      { name: "HPV Vaccine Dashboard", url: "#", icon: "Syringe", description: "ติดตามการฉีดวัคซีน HPV" },
      { name: "MOPH Refer", url: "#", icon: "Ambulance", description: "ระบบส่งต่อผู้ป่วย" },
      { name: "Imaging Hub", url: "#", icon: "Image", description: "ศูนย์รวมภาพถ่ายทางการแพทย์" },
      { name: "MOPH NCD", url: "#", icon: "Activity", description: "ระบบข้อมูลโรคไม่ติดต่อเรื้อรัง" },
    ]
  },
  {
    title: "นโยบาย 30 บาทรักษาทุกที่",
    description: "ระบบสนับสนุนโครงการยกระดับหลักประกันสุขภาพแห่งชาติ",
    links: [
      { name: "ยกระดับ 30 บาทรักษาได้ทุกที่", url: "#", icon: "HeartHandshake", description: "ข้อมูลโครงการหลัก" },
      { name: "โรงพยาบาลอัจฉริยะ", url: "#", icon: "Building2", description: "Smart Hospital" },
      { name: "ติดตามผลการดำเนินงาน PHR", url: "#", icon: "ClipboardCheck", description: "ติดตามการใช้งาน PHR" },
      { name: "MOPH PROVIDER ID", url: "#", icon: "IdCard", description: "ทะเบียนผู้ให้บริการสุขภาพ" },
      { name: "MOPH Health ID", url: "#", icon: "Fingerprint", description: "การพิสูจน์ตัวตนทางดิจิทัล" },
      { name: "Moph Health Rider", url: "#", icon: "Bike", description: "บริการส่งยาถึงบ้าน" },
      { name: "สอน.บัดดี้", url: "#", icon: "Bot", description: "ผู้ช่วยอัจฉริยะ สอน." },
      { name: "ติดตามผล MOPH Refer", url: "#", icon: "LineChart", description: "ติดตามการส่งต่อผู้ป่วย" },
      { name: "ใบรับรองแพทย์อิเล็กทรอนิกส์", url: "#", icon: "FileSignature", description: "e-Medical Certificate" },
      { name: "Digital Signature", url: "#", icon: "PenTool", description: "ระบบลายมือชื่อดิจิทัล" },
      { name: "ติดตามผลการดำเนินงาน FDH", url: "#", icon: "Database", description: "Financial Data Hub" },
      { name: "Dashboard Cyber Security", url: "#", icon: "Lock", description: "ความมั่นคงปลอดภัยไซเบอร์" },
      { name: "Thailand Health Atlas", url: "#", icon: "Map", description: "แผนที่สุขภาพประเทศไทย" },
      { name: "Imaging Hub Dashboard", url: "#", icon: "MonitorPlay", description: "แดชบอร์ดภาพถ่ายการแพทย์" },
      { name: "ProviderID อสม.", url: "#", icon: "Users", description: "ทะเบียนอาสาสมัครสาธารณสุข" },
    ]
  }
];

export const DEFAULT_FOOTER_DATA: FooterData = {
  copyrightText: `© ${new Date().getFullYear()} Ministry of Public Health. All rights reserved.`,
  descriptionText: "Dashboard for internal and public use."
};

export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'password', // Default password for initial setup. Matches simple check in server.js.
    name: 'ผู้ดูแลระบบสูงสุด',
    role: 'admin'
  }
];

export const DEFAULT_DB_CONFIG: DatabaseConfig = {
  host: '192.168.99.71',
  port: '3307',
  user: 'srp',
  password: 'S@r@pee11135',
  database: 'moph_portal_db',
  isInitialized: false
};
