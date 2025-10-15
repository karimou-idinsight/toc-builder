export default function Input({ className = '', ...props }) {
  return (
    <input 
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 ${className}`}
      {...props}
    />
  );
}

