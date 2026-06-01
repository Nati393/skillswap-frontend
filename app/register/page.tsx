'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/api';
import { saveSession } from '@/lib/auth';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', city: '', bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister() {
    setError('');
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const newUser = await createUser(form);
      if (newUser._id) {
        saveSession({ _id: newUser._id, fullName: newUser.fullName, username: newUser.username });
        router.push('/feed');
      } else {
        setError('Error al crear la cuenta. Intenta con otro email o username.');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Inter', Arial, sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>S</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>SkillSwap</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Crea tu cuenta gratis</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', backdropFilter: 'blur(12px)' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Nombre y username en fila */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="María García" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Usuario *</label>
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="maria123" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="tu@email.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Ciudad</label>
              <input type="text" name="city" value={form.city} onChange={handleChange}
                placeholder="Cali" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Biografía</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Cuéntanos un poco sobre ti..."
                rows={2}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.4)', marginTop: 4 }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              ¿Ya tienes cuenta?{' '}
              <span
                onClick={() => router.push('/login')}
                style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
              >
                Inicia sesión
              </span>
            </p>

          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <span
            onClick={() => router.push('/')}
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer' }}
          >
            ← Volver al inicio
          </span>
        </p>

      </div>
    </div>
  );
}