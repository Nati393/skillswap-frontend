'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getExchangesByUser, updateExchangeStatus, getSkillsByUser, getUserById } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { SideMenu } from '../feed/page';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado',
  completed: 'Completado', cancelled: 'Cancelado',
};
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  accepted: { bg: '#dcfce7', color: '#15803d' },
  rejected: { bg: '#fee2e2', color: '#b91c1c' },
  completed: { bg: '#dbeafe', color: '#1d4ed8' },
  cancelled: { bg: '#f1f5f9', color: '#64748b' },
};

export default function AgendaPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [skillsMap, setSkillsMap] = useState<Record<string, string>>({});
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    loadData(s._id);
  }, []);

  async function loadData(userId: string) {
    try {
      const data = await getExchangesByUser(userId);
      const exList = Array.isArray(data) ? data : [];
      setExchanges(exList);

      // Cargar nombres de habilidades
      const skillIds = [...new Set(exList.map((e: any) => e.skillId).filter(Boolean))];
      const userIds = [...new Set([
        ...exList.map((e: any) => e.requesterId),
        ...exList.map((e: any) => e.receiverId),
      ].filter(Boolean))];

      const [skillResults, userResults] = await Promise.all([
        Promise.all(skillIds.map((id: string) =>
          fetch(`/api/skills/${id}`).then(r => r.json()).catch(() => null)
        )),
        Promise.all(userIds.map((id: string) =>
          getUserById(id).catch(() => null)
        )),
      ]);

      const sMap: Record<string, string> = {};
      skillResults.forEach((skill: any) => {
        if (skill?._id) sMap[skill._id] = skill.title;
      });
      setSkillsMap(sMap);

      const uMap: Record<string, string> = {};
      userResults.forEach((user: any) => {
        if (user?._id) uMap[user._id] = user.fullName;
      });
      setUsersMap(uMap);

    } catch {
      setExchanges([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: string) {
    try {
      const updated = await updateExchangeStatus(id, status);
      setExchanges(exchanges.map((e) => (e._id === id ? updated : e)));
    } catch (err: any) {
      alert(err.message || 'Error al actualizar');
    }
  }

  const filtered = filter === 'all' ? exchanges : exchanges.filter((e) => e.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter', Arial, sans-serif" }}>
      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Mi agenda</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Gestiona tus intercambios</p>
          </div>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
            <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 4, scrollbarWidth: 'none' }}>
          {['all', 'pending', 'accepted', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: 20,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filter === f ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              border: filter === f ? 'none' : '1px solid #e2e8f0',
            }}>
              {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>Cargando agenda...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, background: '#fff', borderRadius: 20, padding: 40, border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 32, margin: '0 0 12px' }}>📅</p>
            <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>No hay intercambios aquí</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((exchange) => {
              const isRequester = exchange.requesterId === session?._id;
              const s = STATUS_STYLE[exchange.status] ?? STATUS_STYLE.cancelled;
              const skillName = skillsMap[exchange.skillId] ?? 'Habilidad';
              const otherUserId = isRequester ? exchange.receiverId : exchange.requesterId;
              const otherUserName = usersMap[otherUserId] ?? 'Usuario';
              return (
                <div key={exchange._id} style={{ background: '#fff', borderRadius: 20, padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                  {/* Cabecera */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                        {isRequester ? '📤 Tú solicitaste a' : '📥 Solicitud de'}
                      </span>
                      <p
                        onClick={() => router.push(`/profile/${otherUserId}`)}
                        style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#4f46e5', cursor: 'pointer' }}
                      >
                        {otherUserName}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
                      {STATUS_LABELS[exchange.status]}
                    </span>
                  </div>

                  {/* Habilidad destacada */}
                  <div style={{ background: '#f1f0fe', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🎯</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Habilidad</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>{skillName}</p>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: exchange.message ? 10 : 12 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#4f46e5' }}>{exchange.hours}h</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duración</p>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 16 }}>{exchange.modality === 'virtual' ? '🌐' : '📍'}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{exchange.modality === 'virtual' ? 'Virtual' : 'Presencial'}</p>
                    </div>
                    {exchange.scheduledAt && (
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', flex: 2, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                          {new Date(exchange.scheduledAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {new Date(exchange.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {exchange.message && (
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', fontStyle: 'italic', background: '#f8fafc', borderRadius: 10, padding: '8px 12px' }}>
                      "{exchange.message}"
                    </p>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {!isRequester && exchange.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(exchange._id, 'accepted')} style={{ flex: 1, padding: '9px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Aceptar</button>
                        <button onClick={() => handleStatus(exchange._id, 'rejected')} style={{ flex: 1, padding: '9px', borderRadius: 12, border: '1px solid #fecaca', cursor: 'pointer', background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>Rechazar</button>
                      </>
                    )}
                    {exchange.status === 'accepted' && (
                      <>
                        <button onClick={() => handleStatus(exchange._id, 'completed')} style={{ flex: 1, padding: '9px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Marcar completado</button>
                        <button onClick={() => handleStatus(exchange._id, 'cancelled')} style={{ padding: '9px 14px', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', color: '#94a3b8', fontSize: 13 }}>Cancelar</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}