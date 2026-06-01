'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllSkills, getAllPosts, likePost } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { SideMenu } from '../feed/page';

const CATEGORIES = ['Todos', 'Music', 'Languages', 'Technology', 'Cooking', 'Art', 'Sports', 'Other'];

function getLikesKey(userId: string) { return `skillswap_likes_${userId}`; }

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [tab, setTab] = useState<'posts' | 'skills'>(
    (searchParams.get('tab') as 'posts' | 'skills') || 'posts'
  );
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const user = getSession();
    if (!user) { router.push('/login'); return; }
    setSession(user);
    try {
      const saved = localStorage.getItem(getLikesKey(user._id));
      if (saved) setLikedPosts(new Set(JSON.parse(saved)));
    } catch { }
    Promise.all([getAllSkills(), getAllPosts()])
      .then(([s, p]) => { setSkills(Array.isArray(s) ? s : []); setPosts(Array.isArray(p) ? p : []); })
      .catch(() => { setSkills([]); setPosts([]); })
      .finally(() => setLoading(false));
  }, []);

  async function handleLike(postId: string) {
    if (!session || likedPosts.has(postId)) return;
    try {
      await likePost(postId);
      const newLiked = new Set([...likedPosts, postId]);
      setLikedPosts(newLiked);
      localStorage.setItem(getLikesKey(session._id), JSON.stringify([...newLiked]));
      setPosts(posts.map(p => p._id === postId ? { ...p, likesCount: (p.likesCount ?? 0) + 1 } : p));
      if (selectedPost?._id === postId) {
        setSelectedPost({ ...selectedPost, likesCount: (selectedPost.likesCount ?? 0) + 1 });
      }
    } catch { }
  }

  const filteredSkills = skills.filter((s) => {
    const matchSearch = s.title?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Todos' || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter', Arial, sans-serif" }}>
      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Modal de post */}
      {selectedPost && (
        <>
          <div onClick={() => setSelectedPost(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 460, background: '#fff', borderRadius: 20, overflow: 'hidden', zIndex: 101, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            {selectedPost.imageUrl && (
              <img src={selectedPost.imageUrl} alt={selectedPost.title} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
            )}
            <div style={{ padding: '16px 18px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', flex: 1, paddingRight: 10 }}>{selectedPost.title}</h3>
                <button onClick={() => handleLike(selectedPost._id)} disabled={likedPosts.has(selectedPost._id)}
                  style={{ background: likedPosts.has(selectedPost._id) ? '#fef2f2' : '#f8fafc', border: `1px solid ${likedPosts.has(selectedPost._id) ? '#fecaca' : '#e2e8f0'}`, borderRadius: 20, padding: '5px 12px', cursor: likedPosts.has(selectedPost._id) ? 'default' : 'pointer', fontSize: 13, color: likedPosts.has(selectedPost._id) ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, flexShrink: 0 }}>
                  {likedPosts.has(selectedPost._id) ? '❤️' : '🤍'} {selectedPost.likesCount ?? 0}
                </button>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{selectedPost.description}</p>
              <button onClick={() => { setSelectedPost(null); selectedPost.userId && router.push(`/profile/${selectedPost.userId}`); }}
                style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Ver perfil →
              </button>
              <button onClick={() => setSelectedPost(null)} style={{ width: '100%', marginTop: 8, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', padding: '8px' }}>
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Explorar</h2>
            <button onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 14, height: 2, background: '#0f172a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#0f172a', borderRadius: 2 }} />
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar publicaciones o habilidades..."
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px 10px 36px', fontSize: 13, outline: 'none', background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '14px 16px' }}>

        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {(['posts', 'skills'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#4f46e5' : '#94a3b8', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
              {t === 'posts' ? 'Publicaciones' : 'Habilidades'}
            </button>
          ))}
        </div>

        {tab === 'skills' && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 4, scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 20,
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: selectedCategory === cat ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#64748b',
                border: selectedCategory === cat ? 'none' : '1px solid #e2e8f0',
              }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>Cargando...</p>
        ) : tab === 'posts' ? (
          filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>📷</p>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No se encontraron publicaciones</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
              {filteredPosts.map((post) => (
                <PostTile key={post._id} post={post} liked={likedPosts.has(post._id)} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )
        ) : (
          filteredSkills.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>🔎</p>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No se encontraron habilidades</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSkills.map((skill) => (
                <div key={skill._id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#ede9fe', color: '#5b21b6' }}>{skill.category}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: skill.type === 'offer' ? '#dcfce7' : '#fff7ed', color: skill.type === 'offer' ? '#15803d' : '#c2410c' }}>
                        {skill.type === 'offer' ? 'Ofrece' : 'Busca'}
                      </span>
                      {skill.type === 'offer' && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: skill.skillType === 'professional' ? '#dbeafe' : '#f1f5f9', color: skill.skillType === 'professional' ? '#1d4ed8' : '#475569' }}>
                          {skill.skillType === 'professional' ? 'Profesional' : 'Hobby'}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{skill.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{skill.description}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>Nivel: {skill.experienceLevel}</p>
                  </div>
                  <button onClick={() => router.push(`/profile/${skill.userId}`)} style={{ marginLeft: 12, background: '#f1f0fe', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#4f46e5', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Ver perfil
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}

function PostTile({ post, liked, onClick }: { post: any; liked: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', aspectRatio: '1', cursor: 'pointer', overflow: 'hidden', background: '#e2e8f0' }}>
      {post.imageUrl ? (
        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.3s ease' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📝</div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(15,23,42,0.5)' : 'transparent', transition: 'background 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {hovered && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontWeight: 700, fontSize: 13 }}>
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{post.likesCount ?? 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}