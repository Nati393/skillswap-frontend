'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser, createSkill } from '@/lib/api';
import { getSession, clearSession } from '@/lib/auth';

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 5,
};

export default function EditProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [form, setForm] = useState({ fullName: '', bio: '', city: '', profilePicture: '' });
  const [skillForm, setSkillForm] = useState({
    title: '', description: '', type: 'offer',
    category: 'Music', experienceLevel: 'beginner',
    skillType: 'hobby', certificateUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    loadUser(s._id);
  }, []);

  async function loadUser(id: string) {
    const user = await getUserById(id);
    setForm({
      fullName: user.fullName || '',
      bio: user.bio || '',
      city: user.city || '',
      profilePicture: user.profilePicture || '',
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSkillChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setSkillForm({ ...skillForm, [e.target.name]: e.target.value });
  }

  async function handleSaveProfile() {
    if (!form.fullName.trim()) {
      setMessage('El nombre completo es obligatorio');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      await updateUser(session._id, form);
      setMessage('Perfil actualizado correctamente ✓');
      setMessageType('success');
    } catch {
      setMessage('Error al guardar');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSkill() {
    // Validación de campos obligatorios
    if (!skillForm.title.trim()) {
      setMessage('El nombre de la habilidad es obligatorio');
      setMessageType('error');
      return;
    }
    if (!skillForm.description.trim()) {
      setMessage('La descripción es obligatoria');
      setMessageType('error');
      return;
    }
    if (skillForm.type === 'offer' && skillForm.skillType === 'professional' && !skillForm.certificateUrl.trim()) {
      setMessage('Las habilidades profesionales requieren un certificado');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await createSkill({ ...skillForm, userId: session._id });
      setMessage('Habilidad agregada correctamente ✓');
      setMessageType('success');
      setSkillForm({ title: '', description: '', type: 'offer', category: 'Music', experienceLevel: 'beginner', skillType: 'hobby', certificateUrl: '' });
    } catch {
      setMessage('Error al agregar habilidad');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 40, fontFamily: "'Inter', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Volver</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Editar perfil</h1>
        <button onClick={handleLogout} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Datos personales */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Datos personales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Nombre completo *', name: 'fullName' },
              { label: 'Ciudad', name: 'city' },
              { label: 'URL foto de perfil', name: 'profilePicture' },
            ].map((field) => (
              <div key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Biografía</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
            <button onClick={handleSaveProfile} disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* Agregar habilidad */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Agregar habilidad</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre de la habilidad *</label>
              <input type="text" name="title" value={skillForm.title} onChange={handleSkillChange}
                placeholder="Ej: Clases de guitarra" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descripción *</label>
              <textarea name="description" value={skillForm.description} onChange={handleSkillChange}
                placeholder="Describe tu habilidad..." rows={2}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>

            {[
              { label: 'Tipo', name: 'type', options: [{ value: 'offer', label: 'Ofrezco' }, { value: 'request', label: 'Busco' }] },
              { label: 'Categoría', name: 'category', options: ['Music','Languages','Technology','Cooking','Art','Sports','Other'].map(c => ({ value: c, label: c })) },
              { label: 'Nivel', name: 'experienceLevel', options: [{ value: 'beginner', label: 'Principiante' }, { value: 'intermediate', label: 'Intermedio' }, { value: 'advanced', label: 'Avanzado' }] },
            ].map((field) => (
              <div key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <select name={field.name} value={(skillForm as any)[field.name]} onChange={handleSkillChange}
                  style={{ ...inputStyle }}>
                  {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}

            {/* Solo mostrar tipo de habilidad y certificado si es una oferta */}
            {skillForm.type === 'offer' && (
              <div>
                <label style={labelStyle}>Tipo de habilidad</label>
                <select name="skillType" value={skillForm.skillType} onChange={handleSkillChange} style={{ ...inputStyle }}>
                  <option value="hobby">Hobby</option>
                  <option value="professional">Profesional</option>
                </select>
              </div>
            )}

            {skillForm.type === 'offer' && skillForm.skillType === 'professional' && (
              <div>
                <label style={labelStyle}>URL del certificado *</label>
                <input type="text" name="certificateUrl" value={skillForm.certificateUrl} onChange={handleSkillChange}
                  placeholder="https://..." style={inputStyle} />
              </div>
            )}

            <button onClick={handleAddSkill} disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Agregando...' : 'Agregar habilidad'}
            </button>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div style={{ background: messageType === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: messageType === 'success' ? '#15803d' : '#dc2626' }}>
              {message}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}