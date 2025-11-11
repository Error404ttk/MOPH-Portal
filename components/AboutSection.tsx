import React from 'react';
import { Building2, Target, History, Users, Phone, Globe } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-12 mt-8 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          เกี่ยวกับกระทรวงสาธารณสุข
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overview & Vision Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="text-moph-600" />
              ภาพรวมองค์กร
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              กระทรวงสาธารณสุข (MOPH) เป็นองค์กรหลักด้านสุขภาพของประเทศไทย มีหน้าที่ในการสร้างเสริมสุขภาพ ป้องกันควบคุมโรค รักษาพยาบาล และฟื้นฟูสมรรถภาพของประชาชน เพื่อให้ประชาชนมีสุขภาพดีและเข้าถึงบริการทางแพทย์ได้อย่างเท่าเทียม
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-start gap-3 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <Target className="text-indigo-500 shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-semibold text-indigo-900 mb-1">วิสัยทัศน์ (Vision)</h4>
                    <p className="text-indigo-700/80">"ประชาชนสุขภาพดี เจ้าหน้าที่มีความสุข ระบบสุขภาพยั่งยืน"</p>
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">ลิงก์ที่เกี่ยวข้อง</h3>
            <div className="space-y-4">
              <a href="https://www.moph.go.th" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-moph-50 transition-all duration-300 group border border-slate-100 hover:border-moph-200">
                <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm group-hover:bg-moph-500 group-hover:text-white transition-colors">
                  <Globe size={20} />
                </div>
                <span className="text-slate-700 group-hover:text-moph-700 font-medium">เว็บไซต์หลักกระทรวงฯ</span>
              </a>
              <a href="https://www.moph.go.th/index.php/about/history" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-all duration-300 group border border-slate-100 hover:border-blue-200">
                <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <History size={20} />
                </div>
                <span className="text-slate-700 group-hover:text-blue-700 font-medium">ประวัติความเป็นมา</span>
              </a>
               <a href="https://www.moph.go.th/index.php/about/executive" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 transition-all duration-300 group border border-slate-100 hover:border-purple-200">
                <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <span className="text-slate-700 group-hover:text-purple-700 font-medium">คณะผู้บริหาร</span>
              </a>
              <a href="https://www.moph.go.th/index.php/contact" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 transition-all duration-300 group border border-slate-100 hover:border-orange-200">
                <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <span className="text-slate-700 group-hover:text-orange-700 font-medium">ข้อมูลการติดต่อ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
