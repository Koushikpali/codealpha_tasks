const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' };
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-blue-500 border-t-transparent`} />
    </div>
  );
};

export default Spinner;
