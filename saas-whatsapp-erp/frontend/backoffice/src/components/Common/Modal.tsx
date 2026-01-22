import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">

            {/* Backdrop */}
            <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Content */}
            <div className={`relative bg-white w-full ${sizeClasses[size]} rounded-[2rem] shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[90vh]`}>
                <div className="p-8 border-b border-surface-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="text-2xl font-black text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {children}
                </div>

                {footer && (
                    <div className="p-8 border-t border-surface-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
