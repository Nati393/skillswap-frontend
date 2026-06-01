'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, getExchangesByUser, getReviewsByUser } from '@/lib/api';
import { getSession, clearSession } from '@/lib/auth';
import { BottomNav, SideMenu } from '../feed/page';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    loadData(s._id);
  }, []);

  async function loadData(id: string) {
    try {
      const [userData, exchangesData, reviewsData] = await Promise.all([
        getUserById(id),
        getExchangesByUser(id),
        getReviewsByUser(id),
      ]);
      setUser(userData);
      setExchanges(Array.isArray(exchangesData) ? exchangesData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch {
      console.error('Error cargando dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',Arial,sans-serif" }}>
      <p style={{ color: '#94a3b8' }}>Cargando tu panel...</p>
    </div>
  );

  const completedExchanges = exchanges.filter(e => e.status === 'completed');
  const pendingExchanges = exchanges.filter(e => e.status === 'pending');
  const acceptedExchanges = exchanges.filter(e => e.status === 'accepted');
  const totalHoursExchanged = completedExchanges.reduce((sum, e) => sum + (e.hours || 0), 0);

  const badges: { icon: string; label: string; desc: string }[] = [];
  if (completedExchanges.length >= 1) badges.push({ icon: '🎯', label: 'Primer trueque', desc: 'Completaste tu primer intercambio' });
  if (completedExchanges.length >= 5) badges.push({ icon: '🔥', label: 'En racha', desc: '5 trueques completados' });
  if (completedExchanges.length >= 10) badges.push({ icon: '⭐', label: 'Experto', desc: '10 trueques completados' });
  if (totalHoursExchanged >= 5) badges.push({ icon: '⏱️', label: '5 horas', desc: '5 horas intercambiadas en total' });
  if ((user?.averageRating ?? 0) >= 4) badges.push({ icon: '💎', label: 'Muy valorado', desc: 'Promedio de 4 estrellas o más' });
  if (reviews.length >= 3) badges.push({ icon: '🏅', label: 'Bien reseñado', desc: '3 o más reseñas recibidas' });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter',Arial,sans-serif" }}>
    {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Volver</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Mi panel</h1>
        <button onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
          <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tarjeta hero oscura */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(79,70,229,0.2)' }}>
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)', padding: '24px 20px' }}>

            {/* Identidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {user?.fullName?.[0] ?? '?'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: 18 }}>{user?.fullName}</h2>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>@{user?.username}</p>
                {user?.city && <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>📍 {user.city}</p>}
              </div>
              <button
                onClick={() => router.push(`/profile/${session?._id}`)}
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                Mi perfil
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { value: user?.timeBalance ?? 0, label: 'horas disponibles', highlight: true },
                { value: `⭐ ${user?.averageRating ?? 0}`, label: 'valoración' },
                { value: totalHoursExchanged, label: 'horas totales' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0, fontSize: stat.highlight ? 26 : 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ margin: '5px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.3 }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Botón banco de tiempo */}
            <button
              onClick={() => router.push('/bank')}
              style={{ width: '100%', marginTop: 14, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, padding: '11px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ⏱️ Ver mi banco de tiempo →
            </button>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

          {/* Solicitudes pendientes — solo info, sin botón */}
          <div style={{ background: pendingExchanges.length > 0 ? '#fef9c3' : '#fff', borderRadius: 16, padding: '16px 14px', border: `1px solid ${pendingExchanges.length > 0 ? '#fde68a' : '#f1f5f9'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: pendingExchanges.length > 0 ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              📅
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: pendingExchanges.length > 0 ? '#854d0e' : '#94a3b8' }}>
                {pendingExchanges.length}
              </p>
              <p style={{ margin: '1px 0 0', fontSize: 12, fontWeight: 600, color: pendingExchanges.length > 0 ? '#92400e' : '#94a3b8' }}>
                {pendingExchanges.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
              </p>
            </div>
          </div>

          {/* Editar perfil */}
          <div onClick={() => router.push('/profile/edit')}
            style={{ background: '#fff', borderRadius: 16, padding: '16px 14px', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✏️</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Editar perfil</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Actualiza tus datos</p>
            </div>
          </div>

          {/* Agregar habilidad — ocupa todo el ancho */}
          <div onClick={() => router.push('/profile/edit')}
            style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 16, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              ➕
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Agregar habilidad</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Publica lo que sabes o lo que buscas</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>›</span>
          </div>

        </div>
        {/* Actividad de trueques */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Actividad</h2>
            <span onClick={() => router.push('/agenda')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Ver agenda →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: completedExchanges.length > 0 ? 14 : 0 }}>
            {[
              { value: pendingExchanges.length, label: 'Pendientes', bg: '#fef9c3', color: '#854d0e' },
              { value: acceptedExchanges.length, label: 'Aceptados', bg: '#dcfce7', color: '#15803d' },
              { value: completedExchanges.length, label: 'Completados', bg: '#dbeafe', color: '#1d4ed8' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: stat.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.3 }}>{stat.label}</p>
              </div>
            ))}
          </div>
          {completedExchanges.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recientes</p>
              {completedExchanges.slice(0, 3).map((ex) => (
                <div key={ex._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{ex.modality === 'virtual' ? '🌐' : '📍'}</span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{ex.modality === 'virtual' ? 'Virtual' : 'Presencial'}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>{ex.hours}h</span>
                </div>
              ))}
            </div>
          )}
          {completedExchanges.length === 0 && exchanges.length === 0 && (
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingBottom: 4 }}>Aún no tienes intercambios</p>
          )}
        </div>

        {/* Logros */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Logros</h2>
          {badges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>🏆</p>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Completa tu primer trueque para ganar logros</p>
              <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: 12 }}>Aparecen automáticamente</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {badges.map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faf5ff', borderRadius: 14, padding: '12px', border: '1px solid #ede9fe' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{badge.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#5b21b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{badge.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a78bfa', lineHeight: 1.3 }}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reseñas */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Mis reseñas</h2>
          {reviews.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Aún no tienes reseñas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reviews.slice(0, 3).map((review) => (
                <div key={review._id} style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 12, color: '#f59e0b' }}>{'⭐'.repeat(review.rating)}</span>
                  <p style={{ margin: '5px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}