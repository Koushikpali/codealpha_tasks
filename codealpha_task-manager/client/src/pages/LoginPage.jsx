import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const { data } = await api.post('/auth/login', form); login(data); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const fields = [
    { name: 'email', label: 'Email', type: 'email', value: form.email, onChange: handleChange, placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', value: form.password, onChange: handleChange, placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>
        <AuthForm fields={fields} onSubmit={handleSubmit} submitLabel="Sign In" loading={loading} error={error} />
        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
