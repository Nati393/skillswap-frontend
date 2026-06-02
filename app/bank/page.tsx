'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, getExchangesByUser } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { BottomNav, SideMenu } from '../feed/page';

export default function BankPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    Promise.all([getUserById(s._id), getExchangesByUser(s._id)])
      .then(([u, ex]) => {
        setUser(u);
        setExchanges(Array.isArray(ex) ? ex : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',Arial,sans-serif" }}>
      <p style={{ color: '#94a3b8' }}>Cargando banco de tiempo...</p>
    </div>
  );

  const completed = exchanges.filter(e => e.status === 'completed');
  const pending = exchanges.filter(e => e.status === 'pending');
  const accepted = exchanges.filter(e => e.status === 'accepted');

  const hoursEarned = completed
    .filter(e => e.receiverId === session?._id)
    .reduce((sum, e) => sum + (e.hours || 0), 0);

  const hoursSpent = completed
    .filter(e => e.requesterId === session?._id)
    .reduce((sum, e) => sum + (e.hours || 0), 0);

  const totalHours = hoursEarned + hoursSpent;
  const balance = user?.timeBalance ?? 0;
  const earnedPct = totalHours > 0 ? Math.round((hoursEarned / totalHours) * 100) : 50;

  const history = [...completed].sort((a, b) =>
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  const howItWorks = [
    { icon: '🎓', title: 'Enseña y gana horas', desc: 'Cuando alguien completa un intercambio contigo, ganas las horas de esa sesión.' },
    { icon: '📚', title: 'Aprende y usa horas', desc: 'Al solicitar aprender algo y completarse el intercambio, se descuentan horas de tu saldo.' },
    { icon: '🌐', title: 'Banco comunitario', desc: 'Las horas son una moneda de la comunidad. Gana con cualquiera, úsalas con cualquiera.' },
    { icon: '🎁', title: 'Saldo inicial', desc: 'Todos los usuarios nuevos comienzan con 2 horas de regalo.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter',Arial,sans-serif" }}>

      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Volver</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Mi banco de tiempo</h1>
        <button onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
          <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: '#0f0a2e', padding: '24px 16px 32px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)', borderRadius: 24, padding: '28px 24px', boxShadow: '0 8px 40px rgba(79,70,229,0.35)' }}>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Tu saldo disponible</p>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 80, fontWeight: 900, color: '#fff', letterSpacing: -4, lineHeight: 1 }}>{balance}</span>
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>horas</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Úsalas para aprender con la comunidad</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { value: hoursEarned, label: 'Horas ganadas', icon: '⬆️', color: '#4ade80' },
              { value: hoursSpent, label: 'Horas usadas', icon: '⬇️', color: '#f87171' },
              { value: completed.length, label: 'Trueques', icon: '✅', color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 22 }}>{s.icon}</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: -1 }}>{s.value}</p>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 15, color: '#4ade80', fontWeight: 700 }}>⬆️ +{hoursEarned}h ganadas</span>
              <span style={{ fontSize: 15, color: '#f87171', fontWeight: 700 }}>⬇️ -{hoursSpent}h usadas</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${earnedPct}%`, height: '100%', background: 'linear-gradient(90deg,#22c55e,#4ade80)', borderRadius: 99, transition: 'width 0.6s ease', minWidth: totalHours > 0 ? 10 : 0 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{earnedPct}% enseñando</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{100 - earnedPct}% aprendiendo</span>
            </div>
          </div>

          {(pending.length > 0 || accepted.length > 0) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {pending.length > 0 && (
                <div onClick={() => router.push('/agenda')}
                  style={{ flex: 1, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⏳</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{pending.length}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.3 }}>pendientes</p>
                  </div>
                </div>
              )}
              {accepted.length > 0 && (
                <div onClick={() => router.push('/agenda')}
                  style={{ flex: 1, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🤝</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>{accepted.length}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.3 }}>aceptados</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cuerpo dos columnas */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 14, alignItems: 'start' }}>

        {/* Historial */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Historial de movimientos</h2>
            <span style={{ fontSize: 13, color: '#94a3b8', background: '#f1f5f9', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>{completed.length} intercambios</span>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 36, margin: '0 0 12px' }}>⏱️</p>
              <p style={{ color: '#475569', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Aún no tienes intercambios completados</p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 18px' }}>Completa tu primer trueque para ver tu historial aquí</p>
              <button onClick={() => router.push('/explore?tab=skills')}
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Explorar habilidades →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {history.map((ex, i) => {
                const isEarned = ex.receiverId === session?._id;
                const date = new Date(ex.updatedAt || ex.createdAt);
                return (
                  <div key={ex._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < history.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: isEarned ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1.5px solid ${isEarned ? '#bbf7d0' : '#fecaca'}` }}>
                      {isEarned ? '⬆️' : '⬇️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {isEarned ? 'Horas ganadas enseñando' : 'Horas usadas aprendiendo'}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>
                        {ex.modality === 'virtual' ? '🌐 Virtual' : '📍 Presencial'} · {date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: isEarned ? '#16a34a' : '#dc2626', letterSpacing: -0.5 }}>
                        {isEarned ? '+' : '-'}{ex.hours}h
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky derecha */}
        <div style={{ position: 'sticky', top: 70 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 12 }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>¿Cómo funciona?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {howItWorks.map((item) => (
                <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#f1f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Botón — lleva a habilidades */}
          <button onClick={() => router.push('/explore?tab=skills')}
            style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 16, padding: '14px', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
            🔍 Explorar habilidades
          </button>
        </div>
      </div>

    </div>
  );
}