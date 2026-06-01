'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, getExchangesByUser } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { BottomNav, SideMenu } from '../feed/page';

// Clave localStorage para mensajes
function getMsgsKey(userId: string) { return `skillswap_msgs_${userId}`; }

function loadChats(myId: string): Record<string, { text: string; from: string; ts: number }[]> {
  try {
    const raw = localStorage.getItem(getMsgsKey(myId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveChats(myId: string, chats: Record<string, { text: string; from: string; ts: number }[]>) {
  localStorage.setItem(getMsgsKey(myId), JSON.stringify(chats));
}

export default function MessagesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<Record<string, { text: string; from: string; ts: number }[]>>({});
  const [openChat, setOpenChat] = useState<any>(null);
  const [newMsg, setNewMsg] = useState('');
  const [filter, setFilter] = useState<'all' | 'exchanges' | 'following'>('all');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    setChats(loadChats(s._id));
    loadContacts(s);
  }, []);

  async function loadContacts(s: any) {
    try {
      const [usersData, exchangesData] = await Promise.all([
        getAllUsers(),
        getExchangesByUser(s._id),
      ]);
      const users = Array.isArray(usersData) ? usersData.filter((u: any) => u._id !== s._id) : [];
      const exchanges = Array.isArray(exchangesData) ? exchangesData : [];
      setAllUsers(users);

      // IDs de personas con quienes has hecho trueques
      const exchangeUserIds = new Set(exchanges.flatMap((e: any) => [e.requesterId, e.receiverId]).filter((id: string) => id !== s._id));

      // IDs de personas que sigues o te siguen (de la sesión guardada, o del backend)
      const meData = await fetch(`http://localhost:3000/users/${s._id}`).then(r => r.json()).catch(() => null);
      const followingIds = new Set([
        ...(meData?.following || []),
        ...(meData?.followers || []),
      ]);

      // Enriquecer usuarios con metadata
      const enriched = users.map((u: any) => ({
        ...u,
        hasExchange: exchangeUserIds.has(u._id),
        isFollowing: followingIds.has(u._id),
      }));

      setContacts(enriched);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage() {
    if (!newMsg.trim() || !openChat || !session) return;
    const msg = { text: newMsg.trim(), from: session._id, ts: Date.now() };
    const updated = { ...chats, [openChat._id]: [...(chats[openChat._id] || []), msg] };
    setChats(updated);
    saveChats(session._id, updated);
    setNewMsg('');
  }

  const filteredContacts = contacts.filter((u) => {
    if (filter === 'exchanges') return u.hasExchange;
    if (filter === 'following') return u.isFollowing;
    return u.hasExchange || u.isFollowing;
  });

  const getLastMsg = (userId: string) => {
    const msgs = chats[userId];
    if (!msgs || msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  };

  // Ordenar: primero los que tienen mensajes
  const sorted = [...filteredContacts].sort((a, b) => {
    const aLast = getLastMsg(a._id)?.ts ?? 0;
    const bLast = getLastMsg(b._id)?.ts ?? 0;
    return bLast - aLast;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter', Arial, sans-serif" }}>
    {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Chat abierto */}
      {openChat && (
        <div style={{ position: 'fixed', inset: 0, background: '#f8fafc', zIndex: 200, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', Arial, sans-serif" }}>

          {/* Header del chat */}
          <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
            <button onClick={() => setOpenChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b', padding: '0 4px', lineHeight: 1 }}>←</button>
            <div
              onClick={() => { setOpenChat(null); router.push(`/profile/${openChat._id}`); }}
              style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>
              {openChat.fullName?.[0] ?? '?'}
            </div>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setOpenChat(null); router.push(`/profile/${openChat._id}`); }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{openChat.fullName}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>@{openChat.username}</p>
            </div>
            <button
              onClick={() => { setOpenChat(null); router.push(`/profile/${openChat._id}`); }}
              style={{ background: '#f1f0fe', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#4f46e5', fontWeight: 600 }}>
              Ver perfil
            </button>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(!chats[openChat._id] || chats[openChat._id].length === 0) ? (
              <div style={{ textAlign: 'center', marginTop: 60 }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>💬</p>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Inicia la conversación con {openChat.fullName?.split(' ')[0]}</p>
              </div>
            ) : (
              chats[openChat._id].map((msg, i) => {
                const isMe = msg.from === session._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#fff',
                      color: isMe ? '#fff' : '#0f172a',
                      fontSize: 14, lineHeight: 1.5,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      border: isMe ? 'none' : '1px solid #f1f5f9',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input de mensaje */}
          <div style={{ background: '#fff', padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 24, padding: '10px 16px', fontSize: 14, color: '#0f172a', outline: 'none', background: '#f8fafc' }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              style={{ width: 42, height: 42, borderRadius: '50%', background: newMsg.trim() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#e2e8f0', border: 'none', cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'background 0.15s' }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Mensajes</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{contacts.filter(u => u.hasExchange || u.isFollowing).length} personas disponibles</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '14px 16px' }}>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'exchanges', label: '🔄 Trueques' },
            { key: 'following', label: '👥 Seguidos' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
              whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: 20,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filter === f.key ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#fff',
              color: filter === f.key ? '#fff' : '#64748b',
              border: filter === f.key ? 'none' : '1px solid #e2e8f0',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>Cargando...</p>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, background: '#fff', borderRadius: 20, padding: 40, border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 32, margin: '0 0 10px' }}>
              {filter === 'exchanges' ? '🔄' : filter === 'following' ? '👥' : '💬'}
            </p>
            <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 6px' }}>
              {filter === 'exchanges' ? 'Aún no tienes trueques realizados' : filter === 'following' ? 'Aún no sigues a nadie' : 'No hay usuarios todavía'}
            </p>
            {filter !== 'all' && (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Cambia el filtro para ver más</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sorted.map((user) => {
              const lastMsg = getLastMsg(user._id);
              const unread = false; // Para cuando tengamos backend real
              return (
                <div key={user._id}
                  onClick={() => setOpenChat(user)}
                  style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>

                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
                      {user.fullName?.[0] ?? '?'}
                    </div>
                    {user.hasExchange && (
                      <span style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', display: 'block' }} title="Trueque realizado" />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</p>
                      {lastMsg && (
                        <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, marginLeft: 8 }}>
                          {new Date(lastMsg.ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: lastMsg ? '#475569' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg
                        ? (lastMsg.from === session._id ? `Tú: ${lastMsg.text}` : lastMsg.text)
                        : `@${user.username}`}
                    </p>
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