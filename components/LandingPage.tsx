
import React from 'react';
import { ArrowRight, Compass, Layout, Sparkles, Star, Rocket, Users, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-full bg-doodle-bg flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Decorative Blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-doodle-yellow rounded-full border-3 border-doodle-black opacity-50 animate-bounce" style={{animationDuration: '3s'}}></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-doodle-orange rounded-full border-3 border-doodle-black opacity-50 animate-pulse"></div>
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-doodle-blue rounded-full border-3 border-doodle-black"></div>
      
      {/* Content Container */}
      <div className="z-10 text-center max-w-4xl px-6 relative">
        <div className="inline-flex items-center space-x-2 bg-white text-doodle-black px-4 py-2 rounded-full text-sm font-bold mb-8 border-3 border-doodle-black shadow-pop transform -rotate-2">
          <Star size={18} className="text-doodle-yellow fill-current" />
          <span>新一代 AI 教学设计引擎</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-black text-doodle-black tracking-tight mb-8 leading-tight">
          PBL 课程 <br/>
          <span className="text-doodle-blue relative inline-block">
            设计工坊
            <svg className="absolute w-full h-4 -bottom-1 left-0 text-doodle-yellow" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed bg-white/80 p-4 rounded-xl border-2 border-dashed border-gray-300">
          像搭积木一样设计课程。结合 AI 智能辅助，将复杂的工程教育项目拆解为可视化的教学积木。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
           <button 
             onClick={onStart}
             className="group relative px-8 py-4 bg-doodle-yellow text-doodle-black text-xl font-black rounded-2xl hover:bg-yellow-300 border-3 border-doodle-black shadow-pop hover:shadow-pop-hover active:shadow-pop-active active:translate-y-1 transition-all flex items-center justify-center gap-3"
           >
             <GraduationCap size={28} className="group-hover:rotate-12 transition-transform"/>
             教师端登录
           </button>
           <button 
             onClick={() => alert('学生端功能开发中...')}
             className="group relative px-8 py-4 bg-white text-doodle-black text-xl font-black rounded-2xl hover:bg-gray-50 border-3 border-doodle-black shadow-pop hover:shadow-pop-hover active:shadow-pop-active active:translate-y-1 transition-all flex items-center justify-center gap-3"
           >
             <Users size={28} className="group-hover:scale-110 transition-transform"/>
             学生端登录
           </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl px-6 w-full">
          <FeatureCard 
            icon={<Compass className="text-doodle-black" size={32}/>}
            title="可视化画布"
            desc="拖拽式组件库，直观呈现 EDP 工程设计流程。"
            color="bg-doodle-blue"
          />
          <FeatureCard 
            icon={<Sparkles className="text-doodle-black" size={32}/>}
            title="AI 智能伴侣"
            desc="一键生成量表、任务拆解，提供实时创意支持。"
            color="bg-doodle-purple"
          />
           <FeatureCard 
            icon={<Layout className="text-doodle-black" size={32}/>}
            title="课堂实录"
            desc="动态监控小组状态，针对性发放教学支架。"
            color="bg-doodle-green"
          />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
    <div className="bg-white border-3 border-doodle-black p-6 rounded-3xl shadow-pop hover:shadow-pop-hover hover:-translate-y-1 transition-all text-left flex flex-col items-start h-full">
        <div className={`w-16 h-16 ${color} rounded-2xl border-3 border-doodle-black flex items-center justify-center mb-4 shadow-pop-sm`}>
            {icon}
        </div>
        <h3 className="font-display font-black text-doodle-black text-xl mb-3">{title}</h3>
        <p className="text-base text-gray-600 font-medium leading-relaxed">{desc}</p>
    </div>
)
