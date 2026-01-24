
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
    variant?: 'header' | 'footer';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'header', className = '' }) => {
    const src = variant === 'header' ? '/assets/logo-header.svg' : '/assets/logo-footer.svg';
    const alt = "Digital Store Logo";

    return (
        <Link to="/" className={`flex items-center gap-2 ${className}`}>
            <img src={src} alt={alt} className={variant === 'header' ? 'h-7 md:h-auto' : 'h-8'} />
        </Link>
    );
};

export default Logo;
