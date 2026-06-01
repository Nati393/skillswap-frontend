'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAllPosts, getAllUsers, likePost, getAllSkills } from '@/lib/api';
import { getSession, clearSession } from '@/lib/auth';

export function BottomNav({ session }: { session: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = [
    { icon: '🏠', label: 'Inicio', path: '/feed' },
    { icon: '🔍', label: 'Explorar', path: '/explore' },
    { icon: '📅', label: 'Agenda', path: '/agenda' },
    { icon: '💬', label: 'Mensajes', path: '/messages' },
    { icon: '👤', label: 'Perfil', path: `/profile/${session?._id}` },
  ];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#f1f3f8', borderTop: '1px solid #d1d5e0', padding: '6px 0 16px', zIndex: 50, fontFamily: "'Inter',Arial,sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {items.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== '/feed' && item.path !== `/profile/${session?._id}` && pathname.startsWith(item.path)) ||
            (item.path === `/profile/${session?._id}` && pathname === `/profile/${session?._id}`);
          return (
            <button key={item.label} onClick={() => router.push(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: isActive ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, transition: 'all 0.18s', boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#4f46e5' : '#64748b' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SideMenu({ session, onClose }: { session: any; onClose: () => void }) {
  const router = useRouter();
  function go(path: string) { onClose(); router.push(path); }
  function logout() { clearSession(); router.push('/login'); }
  const items = [
  { icon: '🏠', label: 'Inicio', path: '/feed' },
  { icon: '🔍', label: 'Explorar', path: '/explore' },
  { icon: '📅', label: 'Agenda', path: '/agenda' },
  { icon: '💬', label: 'Mensajes', path: '/messages' },
  { icon: '👤', label: 'Mi perfil', path: `/profile/${session?._id}` },
  { icon: '📊', label: 'Mi panel', path: '/dashboard' },
  { icon: '⏱️', label: 'Mi banco', path: '/bank' },
  { icon: '👥', label: 'Comunidad', path: '/community' },
];
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 260, background: '#0f0f23', zIndex: 99, display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 48px rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.05)', fontFamily: "'Inter',Arial,sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14 }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>SkillSwap</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{session?.username ? `@${session.username}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, padding: 4, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.map((item) => (
            <div key={item.label} onClick={() => go(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', padding: '13px 20px', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', opacity: 0.25, fontSize: 12 }}>›</span>
            </div>
          ))}
        </div>
        <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f87171', padding: '16px 20px', fontSize: 14, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 17 }}>🚪</span>
          <span style={{ fontWeight: 500 }}>Cerrar sesión</span>
        </div>
      </div>
    </>
  );
}

function getLikesKey(userId: string) { return `skillswap_likes_${userId}`; }

function FeedSidebar({ skills, router }: { skills: any[]; router: any }) {
  const sections = [
    { icon: '🔄', title: 'Intercambia habilidades', desc: 'Enseña lo que sabes, aprende lo que quieres. Sin dinero — solo tiempo.' },
    { icon: '⏱️', title: 'Tu tiempo vale', desc: 'Cada sesión suma horas a tu banco personal. Úsalas cuando quieras con cualquier persona de la comunidad.' },
    { icon: '📸', title: 'Publica lo que haces', desc: 'Comparte fotos de tus habilidades. Así otros usuarios pueden ver lo que ofreces y conectar contigo.' },
    { icon: '🌐', title: 'Descubre perfiles', desc: 'Cada publicación pertenece a alguien de la comunidad. Dale clic a "Ver autor" para ver sus habilidades y solicitarle un intercambio.' },
    { icon: '⭐', title: 'Construye reputación', desc: 'Después de cada trueque, las personas pueden valorarte. Tu puntaje es visible en tu perfil público.' },
  ];

  return (
    <div style={{ position: 'sticky', top: 70, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>S</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>¿Cómo funciona SkillSwap?</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sections.map((s) => (
            <div key={s.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {skills.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Habilidades recientes</p>
            {/* Ver todas → lleva a habilidades */}
            <span onClick={() => router.push('/explore?tab=skills')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Ver todas →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {skills.slice(0, 5).map((skill: any) => (
              <div key={skill._id} onClick={() => router.push(`/profile/${skill.userId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.title}</p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#ede9fe', color: '#5b21b6' }}>{skill.category}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: skill.type === 'offer' ? '#dcfce7' : '#fff7ed', color: skill.type === 'offer' ? '#15803d' : '#c2410c' }}>
                      {skill.type === 'offer' ? 'Ofrece' : 'Busca'}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón — lleva a publicaciones */}
      <button onClick={() => router.push('/explore?tab=posts')}
        style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(79,70,229,0.25)' }}>
        🔍 Explorar
      </button>
    </div>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const user = getSession();
    if (!user) { router.push('/login'); return; }
    setSession(user);
    try {
      const saved = localStorage.getItem(getLikesKey(user._id));
      if (saved) setLikedPosts(new Set(JSON.parse(saved)));
    } catch { }
    Promise.all([getAllPosts(), getAllUsers(), getAllSkills()])
      .then(([p, u, s]) => {
        setPosts(Array.isArray(p) ? p : []);
        setUsers(Array.isArray(u) ? u : []);
        setSkills(Array.isArray(s) ? s : []);
      })
      .catch(() => { setPosts([]); setUsers([]); setSkills([]); })
      .finally(() => setLoading(false));
  }, []);

  async function handleLike(postId: string) {
    if (!session || likedPosts.has(postId)) return;
    try {
      const updated = await likePost(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      const newLiked = new Set([...likedPosts, postId]);
      setLikedPosts(newLiked);
      localStorage.setItem(getLikesKey(session._id), JSON.stringify([...newLiked]));
    } catch { }
  }

  const otherUsers = users.filter(u => u._id !== session?._id);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter',Arial,sans-serif" }}>

      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>S</div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Bienvenido de vuelta</p>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{session?.fullName?.split(' ')[0] ?? 'Usuario'}</h2>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: '2.5px solid #e0e7ff', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {session?.fullName?.[0] ?? '?'}
          </button>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
            <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Balance card */}
      <div onClick={() => router.push('/bank')}
        style={{ background: 'linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>⏱️</span>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>Mi banco de tiempo</p>
            <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: '#fff' }}>Ver mi saldo →</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Banco</span>
        </div>
      </div>

      {/* Usuarios sugeridos */}
      {otherUsers.length > 0 && (
        <div style={{ background: '#fff', padding: '16px 24px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Personas en la comunidad</p>
            <span onClick={() => router.push('/community')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Ver todos</span>
          </div>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {otherUsers.slice(0, 10).map((u) => (
              <div key={u._id} onClick={() => router.push(`/profile/${u._id}`)}
                style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, border: '2.5px solid #e0e7ff' }}>
                    {u.fullName?.[0] ?? '?'}
                  </div>
                  <span style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', display: 'block' }} />
                </div>
                <p style={{ fontSize: 10, color: '#475569', margin: '5px 0 0', width: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.fullName?.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout dos columnas */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 28, alignItems: 'start' }}>

        <div>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Publicaciones recientes</p>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 60 }}>Cargando...</p>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 40, background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 32, margin: '0 0 10px' }}>📭</p>
              <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 6px' }}>Aún no hay publicaciones</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Publica desde tu perfil para aparecer aquí</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {posts.map((post) => (
                <div key={post._id} style={{ background: '#fff', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {post.imageUrl && (
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => post.userId && router.push(`/profile/${post.userId}`)}>
                      <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
                    </div>
                  )}
                  <div style={{ padding: '16px 18px' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{post.title}</h4>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{post.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={() => post.userId && router.push(`/profile/${post.userId}`)}
                        style={{ background: '#f1f0fe', border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer', fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>
                        Ver perfil →
                      </button>
                      <button onClick={() => handleLike(post._id)} disabled={likedPosts.has(post._id)}
                        style={{ background: likedPosts.has(post._id) ? '#fef2f2' : '#f8fafc', border: `1px solid ${likedPosts.has(post._id) ? '#fecaca' : '#e2e8f0'}`, borderRadius: 20, padding: '7px 16px', cursor: likedPosts.has(post._id) ? 'default' : 'pointer', fontSize: 13, color: likedPosts.has(post._id) ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                        {likedPosts.has(post._id) ? '❤️' : '🤍'} {post.likesCount ?? 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FeedSidebar skills={skills} router={router} />
      </div>
    </div>
  );
}