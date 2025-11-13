import React from 'react';

const FadeIn: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={`animate-fade-in ${className}`}>
            {children}
        </div>
    );
};

export default FadeIn;