const AuthForm = ({ fields, onSubmit, submitLabel, loading, error }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-4">
    {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">{error}</div>}
    {fields.map(({ name, label, type, value, onChange, placeholder }) => (
      <div key={name}>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input type={type || 'text'} name={name} value={value} onChange={onChange} placeholder={placeholder} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
      </div>
    ))}
    <button type="submit" disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition">
      {loading ? 'Please wait...' : submitLabel}
    </button>
  </form>
);

export default AuthForm;
