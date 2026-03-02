export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  );
}