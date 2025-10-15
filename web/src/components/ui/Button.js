export default function Button({ variant = 'primary', children, className = '', ...props }) {
  let variantClasses = '';
  
  if (variant === 'primary') {
    variantClasses = 'text-white bg-blue-500 hover:bg-blue-600';
  } else if (variant === 'secondary') {
    variantClasses = 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50';
  } else if (variant === 'danger') {
    variantClasses = 'text-white bg-red-500 hover:bg-red-600';
  } else if (variant === 'disabled') {
    variantClasses = 'text-white bg-blue-300 cursor-not-allowed';
  }

  return (
    <button 
      className={`px-4 py-2 text-sm font-medium border-none rounded-md cursor-pointer transition-colors focus:outline-none ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
