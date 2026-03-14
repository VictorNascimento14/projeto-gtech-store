import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITEM_HEIGHT = 40;

interface DatePickerDropdownProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatches(m.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

export const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  className = '',
  minYear = 1920,
  maxYear = new Date().getFullYear() - 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 639px)');

  const parseValue = (val: string) => {
    if (!val) return { day: 1, month: 0, year: new Date().getFullYear() - 18 };
    const [y, m, d] = val.includes('-')
      ? val.split('-').map(Number)
      : val.split('/').reverse().map(Number);
    if (!y || !m || !d) return { day: 1, month: 0, year: new Date().getFullYear() - 18 };
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return { day: 1, month: 0, year: new Date().getFullYear() - 18 };
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  };

  const { day: initDay, month: initMonth, year: initYear } = parseValue(value);
  const [day, setDay] = useState(initDay);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);

  useEffect(() => {
    const { day: d, month: m, year: y } = parseValue(value);
    const maxD = getDaysInMonth(m + 1, y);
    setDay(Math.min(d, maxD));
    setMonth(m);
    setYear(y);
  }, [value, isOpen]);

  useEffect(() => {
    const maxD = getDaysInMonth(month + 1, year);
    setDay((prev) => Math.min(prev, maxD));
  }, [month, year]);

  const days = Array.from({ length: getDaysInMonth(month + 1, year) }, (_, i) => i + 1);
  const months = MONTHS.map((m, i) => ({ label: m, value: i }));
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const displayValue = value
    ? (() => {
        const [y, m, d] = value.includes('-')
          ? value.split('-').map(Number)
          : value.split('/').reverse().map(Number);
        if (!y || !m || !d) return '';
        const date = new Date(y, m - 1, d);
        if (isNaN(date.getTime())) return '';
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      })()
    : '';

  const handleConfirm = () => {
    const date = new Date(year, month, day);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleCancel = () => {
    const { day: d, month: m, year: y } = parseValue(value);
    setDay(d);
    setMonth(m);
    setYear(y);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY, 10));
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const WheelColumn: React.FC<{
    items: (number | { label: string; value: number })[];
    value: number;
    onChange: (v: number) => void;
  }> = ({ items, value, onChange }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = items.findIndex((i) => (typeof i === 'object' ? i.value : i) === value);
      if (idx < 0) return;
      const targetScroll = idx * ITEM_HEIGHT;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const clampScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      const applyScroll = () => { el.scrollTop = clampScroll; };
      requestAnimationFrame(applyScroll);
      const id = setTimeout(applyScroll, 20);
      return () => clearTimeout(id);
    }, [value, items]);

    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const item = items[idx];
      const v = typeof item === 'object' ? item.value : item;
      if (v !== undefined && v !== value) onChange(v);
    };

    return (
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide"
        style={{
          height: ITEM_HEIGHT * 5,
          minHeight: ITEM_HEIGHT * 5,
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: ITEM_HEIGHT * 2 }} aria-hidden="true" />
        {items.map((item) => {
          const v = typeof item === 'object' ? item.value : item;
          const label = typeof item === 'object' ? item.label : String(item).padStart(2, '0');
          const isSelected = v === value;
          return (
            <div
              key={v}
              className="snap-center flex items-center justify-center text-center cursor-pointer touch-manipulation min-w-0 shrink-0"
              style={{ height: ITEM_HEIGHT, minHeight: ITEM_HEIGHT, padding: 0 }}
              onClick={() => onChange(v)}
            >
              <span
                className={`transition-all select-none ${
                  isSelected
                    ? 'text-gray-900 dark:text-white font-semibold text-base sm:text-lg'
                    : 'text-gray-400 dark:text-gray-500 text-sm sm:text-base'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[50px] sm:min-h-[52px] px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none flex items-center justify-between text-left touch-manipulation active:scale-[0.99]"
      >
        <span className={`truncate text-base sm:text-[15px] ${displayValue ? '' : 'text-gray-400'}`}>
          {displayValue || placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 sm:bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 bg-white dark:bg-gray-900 shadow-2xl
                bottom-0 left-0 right-0 rounded-t-3xl
                sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-w-sm sm:w-[calc(100%-2rem)] sm:max-h-[85vh] sm:overflow-hidden
                pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6"
            >
              <div className="h-1 w-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 sm:mt-4 shrink-0" />
              <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 min-h-[52px] sm:min-h-[56px]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-primary font-medium py-2 px-1 -mx-1 min-w-[72px] text-left sm:text-base touch-manipulation"
                >
                  Cancelar
                </button>
                <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 flex-1 text-center">
                  Data de Nascimento
                </span>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="text-primary font-semibold py-2 px-1 -mx-1 min-w-[48px] text-right sm:text-base touch-manipulation"
                >
                  OK
                </button>
              </div>
              <div className="relative py-4 sm:py-6 px-4 sm:px-6">
                <div
                  className="absolute left-4 right-4 sm:left-6 sm:right-6 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 pointer-events-none z-0"
                  style={{ height: ITEM_HEIGHT, marginTop: -ITEM_HEIGHT / 2 }}
                />
                <div className="relative z-10 flex gap-2 sm:gap-4 min-w-0 overflow-visible" style={{ height: ITEM_HEIGHT * 5, minHeight: ITEM_HEIGHT * 5 }}>
                  <WheelColumn items={days} value={day} onChange={setDay} />
                  <WheelColumn items={months} value={month} onChange={setMonth} />
                  <WheelColumn items={years} value={year} onChange={setYear} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
