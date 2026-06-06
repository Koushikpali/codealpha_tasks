const Avatar = ({ src, username = "?", size = "md", className = "" }) => {
  const sizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-14 h-14 text-xl", xl: "w-20 h-20 text-2xl" };
  const initials = username.slice(0, 1).toUpperCase();

  if (src) {
    return <img src={src} alt={username} className={`${sizes[size]} avatar object-cover ${className}`} />;
  }

  // Generate a consistent color from username
  const colors = ["bg-violet-600","bg-indigo-600","bg-blue-600","bg-cyan-600","bg-teal-600","bg-emerald-600","bg-pink-600","bg-rose-600"];
  const idx = username.charCodeAt(0) % colors.length;

  return (
    <div className={`${sizes[size]} ${colors[idx]} rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;
