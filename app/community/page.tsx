'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, getSkillsByUser } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { SideMenu } from '../feed/page';

export default function CommunityPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [skillsMap, setSkillsMap] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    getAllUsers()
      .then(async (data) => {
        const list = Array.isArray(data) ? data : [];
        setUsers(list);
        const maps: Record<string, string[]> = {};
        await Promise.all(
          list.filter((u: any) => u._id !== s._id).map(async (u: any) => {
            try {
              const skills = await getSkillsByUser(u._id);
              maps[u._id] = Array.isArray(skills) ? skills.slice(0, 2).map((sk: any) => sk.title) : [];
            } catch { maps[u._id] = []; }
          })
        );
        setSkillsMap(maps);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const others = users.filter((u) =>
    u._id !== session?._id && (
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.city?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter', Arial, sans-serif" }}>
      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Comunidad</h2>
            <button onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar personas..."
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '9px 14px 9px 34px', fontSize: 13, outline: 'none', background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>Cargando comunidad...</p>
        ) : others.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{ fontSize: 32, margin: '0 0 10px' }}>👥</p>
            <p style={{ color: '#475569', fontWeight: 600 }}>No se encontraron usuarios</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {others.map((user) => (
              <div key={user._id} onClick={() => router.push(`/profile/${user._id}`)}
                style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                  {user.fullName?.[0] ?? '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user.fullName}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    @{user.username}{user.city ? ` · 📍 ${user.city}` : ''}
                  </p>
                  {skillsMap[user._id]?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                      {skillsMap[user._id].map((sk, i) => (
                        <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#ede9fe', color: '#5b21b6' }}>{sk}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, flexShrink: 0 }}>Ver →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}