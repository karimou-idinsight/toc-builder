export default function Textarea({ className = '', ...props }) {
  return (
    <textarea 
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 resize-vertical min-h-[80px] ${className}`}
      {...props}
    />
  );
}

