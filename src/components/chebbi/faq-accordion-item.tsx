'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Gift, Building2, Bell, TrendingUp, DollarSign, GraduationCap, Shield, Globe, UserCheck, Clock, Percent } from 'lucide-react';
import { type Language } from '@/lib/i18n';
import { pickLang } from '@/lib/trilingual';

export interface DbFaq {
  id: string;
  questionFr?: string;
  questionEn?: string;
  questionAr?: string;
  answerFr?: string;
  answerEn?: string;
  answerAr?: string;
  question?: Record<string, string>;
  answer?: Record<string, string>;
  category: string;
  icon: string;
  order?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  gift: <Gift size={16} />,
  building: <Building2 size={16} />,
  'user-check': <UserCheck size={16} />,
  chart: <TrendingUp size={16} />,
  dollar: <DollarSign size={16} />,
  shield: <Shield size={16} />,
  bell: <Bell size={16} />,
  clock: <Clock size={16} />,
  percent: <Percent size={16} />,
  graduation: <GraduationCap size={16} />,
  globe: <Globe size={16} />,
  help: <HelpCircle size={16} />,
};

interface FaqAccordionItemProps {
  faq: any;
  language: Language;
  isOpen: boolean;
  onToggle: () => void;
}

export function FaqAccordionItem({
  faq,
  language,
  isOpen,
  onToggle,
}: FaqAccordionItemProps) {
  const questionText = pickLang(faq, 'question', language);
  const answerHtml = pickLang(faq, 'answer', language);

  return (
    <motion.div
      layout
      className={`group rounded-xl border transition-all duration-300 overflow-hidden mb-3 ${
        isOpen
          ? 'border-primary/30 shadow-lg shadow-primary/10 bg-card'
          : 'border-border bg-card hover:border-border/80 hover:shadow-sm'
      }`}
    >
      {/* Question */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/30"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isOpen
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            {iconMap[faq.icon] || <HelpCircle size={16} />}
          </div>
          <h3 className={`text-sm md:text-base font-semibold leading-snug transition-colors ${isOpen ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'}`}>
            {questionText}
          </h3>
        </div>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isOpen
              ? 'bg-primary/10 text-primary rotate-45'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Plus size={14} />
        </div>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className={`px-5 pb-5 text-sm text-muted-foreground leading-relaxed faq-inner-html ${language === 'ar' ? 'pr-[4.25rem] pl-5' : 'pl-[4.25rem] pr-5'}`}
              dangerouslySetInnerHTML={{ __html: answerHtml }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
