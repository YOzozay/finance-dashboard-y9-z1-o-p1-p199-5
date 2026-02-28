export default function Input(props) {
  return (
    <input
      {...props}
      className="
        w-full px-4 py-2 rounded-lg border
        bg-white text-gray-900 border-gray-300
        dark:bg-[#1e293b] dark:text-white dark:border-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    />
  );
}