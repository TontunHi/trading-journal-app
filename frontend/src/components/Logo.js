export default function Logo({ className = "w-8 h-8" }) {
    return (
        <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            <rect x="4" y="18" width="6" height="10" rx="1" fill="#3B82F6" fillOpacity="0.6"/>
            <rect x="13" y="12" width="6" height="16" rx="1" fill="#3B82F6" fillOpacity="0.8"/>
            <path d="M22 6H28V28H22V6Z" fill="url(#paint0_linear_logo)"/>
          
            <defs>
                <linearGradient id="paint0_linear_logo" x1="25" y1="6" x2="25" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06B6D4"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
            </defs>
        </svg>
    );
}