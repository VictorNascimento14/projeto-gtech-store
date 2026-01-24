
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDark;
        setIsDark(newMode);

        // Verifica se o navegador suporta View Transitions API
        if (!document.startViewTransition) {
            // Fallback para navegadores que não suportam
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            }
            return;
        }

        // Adiciona classe para desabilitar transições CSS durante a View Transition
        document.documentElement.classList.add('transitioning');

        // Usa a View Transitions API para transição suave
        const transition = document.startViewTransition(() => {
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            }
        });

        // Remove a classe quando a transição terminar
        transition.finished.finally(() => {
            document.documentElement.classList.remove('transitioning');
        });
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-[100] w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-yellow-400"
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default DarkModeToggle;
