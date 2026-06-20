
import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  BookOpen, 
  Settings, 
  Code, 
  Database, 
  HelpCircle, 
  Cpu, 
  Shield, 
  Phone, 
  Zap, 
  ChevronRight,
  Server,
  Network,
  HardDrive,
  Globe,
  Lock,
  Cloud
} from 'lucide-react';

// Componente HeroCard mejorado
export const HeroCard = ({ 
  href, 
  onClick, 
  icon: Icon, 
  title, 
  description, 
  actionText,
  bgColor = "bg-yellow-500",
  textColor = "text-white",
  iconBgColor = "bg-white/20",
  iconHoverBgColor = "group-hover:bg-white/30",
  iconColor = "text-white",
  descriptionColor = "text-yellow-100",
  actionColor = "text-white/80"
}) => {
  return (
    <a 
      href={href}
      onClick={onClick}
      className={`flex-1 ${bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group no-underline`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`${iconBgColor} rounded-full p-3 mb-4 ${iconHoverBgColor} transition`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <h3 className={`${textColor} font-bold text-xl mb-2`}>{title}</h3>
        <p className={`${descriptionColor} text-sm`}>{description}</p>
        <div className={`mt-4 ${actionColor} text-sm font-medium flex items-center gap-1`}>
          {actionText} <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
};