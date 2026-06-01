'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getUserById, getSkillsByUser, getPostsByUser, getReviewsByUser,
  followUser, unfollowUser, createExchange, getAllUsers,
  createPost, createReview, getCompletedExchangesWith, deletePost
} from '@/lib/api';
import { getSession } from '@/lib/auth';
import { SideMenu } from '@/app/feed/page';

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
  padding: '9px 12px', fontSize: 13, color: '#0f172a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#475569',
  display: 'block', marginBottom: 4,
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Exchange form
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({ skillId: '', hours: 1, scheduledAt: '', modality: 'virtual', message: '' });
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeMsg, setExchangeMsg] = useState('');

  // Post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', description: '', imageUrl: '', skillId: '' });
  const [postLoading, setPostLoading] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [completedExchanges, setCompletedExchanges] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ exchangeId: '', rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/login'); return; }
    setSession(s);
    loadProfile(s);
  }, [userId]);

  async function loadProfile(s: any) {
    try {
      const [userData, skillsData, postsData, reviewsData, usersData] = await Promise.all([
        getUserById(userId),
        getSkillsByUser(userId),
        getPostsByUser(userId),
        getReviewsByUser(userId),
        getAllUsers(),
      ]);
      setUser(userData);
      setSkills(Array.isArray(skillsData) ? skillsData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
      setIsFollowing(userData.followers?.some((f: any) => f === s._id || f?._id === s._id));

      // Si es perfil ajeno, cargar trueques completados con ese usuario
      if (s._id !== userId) {
        const completed = await getCompletedExchangesWith(s._id, userId);
        setCompletedExchanges(completed);
      }
    } catch (err) {
      console.error('Error cargando perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    try {
      if (isFollowing) {
        await unfollowUser(userId, session._id);
        setIsFollowing(false);
        setUser({ ...user, followers: (user.followers || []).filter((f: any) => f !== session._id) });
      } else {
        await followUser(userId, session._id);
        setIsFollowing(true);
        setUser({ ...user, followers: [...(user.followers || []), session._id] });
      }
    } catch { }
  }

  async function handleExchange() {
    if (!exchangeForm.skillId) { setExchangeMsg('Selecciona una habilidad'); return; }
    if (!exchangeForm.scheduledAt) { setExchangeMsg('Selecciona una fecha y hora'); return; }
    setExchangeLoading(true);
    setExchangeMsg('');
    try {
      await createExchange({
        requesterId: session._id, receiverId: userId,
        skillId: exchangeForm.skillId, hours: exchangeForm.hours,
        scheduledAt: exchangeForm.scheduledAt, modality: exchangeForm.modality,
        message: exchangeForm.message,
      });
      setExchangeMsg('¡Solicitud enviada! Revisa tu agenda.');
      setShowExchangeForm(false);
      setExchangeForm({ skillId: '', hours: 1, scheduledAt: '', modality: 'virtual', message: '' });
    } catch { setExchangeMsg('Error al enviar la solicitud'); }
    finally { setExchangeLoading(false); }
  }

  async function handleCreatePost() {
    if (!postForm.title.trim()) { setPostMsg('El título es obligatorio'); return; }
    if (!postForm.description.trim()) { setPostMsg('La descripción es obligatoria'); return; }
    if (!postForm.imageUrl.trim()) { setPostMsg('La URL de imagen es obligatoria'); return; }
    setPostLoading(true);
    setPostMsg('');
    try {
      const newPost = await createPost({
        userId: session._id,
        title: postForm.title,
        description: postForm.description,
        imageUrl: postForm.imageUrl,
        ...(postForm.skillId ? { skillId: postForm.skillId } : {}),
      });
      setPosts([newPost, ...posts]);
      setPostMsg('¡Publicación creada!');
      setShowPostForm(false);
      setPostForm({ title: '', description: '', imageUrl: '', skillId: '' });
    } catch { setPostMsg('Error al crear la publicación'); }
    finally { setPostLoading(false); }
  }

  async function handleCreateReview() {
    if (!reviewForm.exchangeId) { setReviewMsg('Selecciona el intercambio'); return; }
    if (!reviewForm.comment.trim()) { setReviewMsg('Escribe un comentario'); return; }
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await createReview({
        exchangeId: reviewForm.exchangeId,
        reviewerId: session._id,
        reviewedId: userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewMsg('¡Reseña enviada!');
      setShowReviewForm(false);
      setReviewForm({ exchangeId: '', rating: 5, comment: '' });
      // Recargar reseñas
      const updated = await getReviewsByUser(userId);
      setReviews(Array.isArray(updated) ? updated : []);
    } catch { setReviewMsg('Error al enviar la reseña'); }
    finally { setReviewLoading(false); }
  }

  const isOwnProfile = session?._id === userId;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Cargando perfil...</p>
    </div>
  );
  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Usuario no encontrado</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 24, fontFamily: "'Inter', Arial, sans-serif" }}>

      {menuOpen && <SideMenu session={session} onClose={() => setMenuOpen(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Volver</button>
        <button onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 4px' }}>
          <span style={{ display: 'block', width: 20, height: 2, background: '#64748b', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 14, height: 2, background: '#64748b', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: '#64748b', borderRadius: 2 }} />
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tarjeta de usuario */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {user.fullName?.[0] ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{user.fullName}</h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>@{user.username}</p>
              {user.city && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>📍 {user.city}</p>}
            </div>
          </div>

          {user.bio && <p style={{ margin: '0 0 16px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{user.bio}</p>}

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{user.followers?.length ?? 0}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Seguidores</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{user.following?.length ?? 0}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Siguiendo</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>⭐ {user.averageRating ?? 0}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Valoración</p>
            </div>
          </div>

          {/* Botones según si es tu perfil o ajeno */}
          {isOwnProfile ? (
            // Tres botones de acción para tu propio perfil
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button onClick={() => router.push('/profile/edit')}
                style={{ padding: '9px 6px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>✏️</span>
                Editar perfil
              </button>
              <button onClick={() => router.push('/profile/edit')}
                style={{ padding: '9px 6px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>➕</span>
                Habilidad
              </button>
              <button onClick={() => { setShowPostForm(!showPostForm); setPostMsg(''); }}
                style={{ padding: '9px 6px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: showPostForm ? '#f1f0fe' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: showPostForm ? '#4f46e5' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16 }}>📸</span>
                Publicar
              </button>
            </div>
          ) : (
            // Botones para perfil ajeno
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleFollow}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: isFollowing ? '#f1f5f9' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: isFollowing ? '#64748b' : '#fff' }}>
                  {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                </button>
                <button onClick={() => { setShowExchangeForm(!showExchangeForm); setExchangeMsg(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: showExchangeForm ? '#f1f5f9' : 'linear-gradient(135deg,#059669,#10b981)', color: showExchangeForm ? '#64748b' : '#fff' }}>
                  {showExchangeForm ? 'Cancelar' : 'Intercambio'}
                </button>
              </div>

              {/* Botón reseña — solo si hay trueques completados */}
              {completedExchanges.length > 0 && (
                <button onClick={() => { setShowReviewForm(!showReviewForm); setReviewMsg(''); }}
                  style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid #fde68a', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: showReviewForm ? '#fef9c3' : '#fff', color: '#92400e' }}>
                  {showReviewForm ? 'Cancelar reseña' : '⭐ Escribir reseña'}
                </button>
              )}
            </div>
          )}

          {/* Formulario crear post */}
          {showPostForm && isOwnProfile && (
            <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Nueva publicación</p>
              <div>
                <label style={labelStyle}>Título *</label>
                <input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="Ej: Mi clase de guitarra de hoy" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descripción *</label>
                <textarea value={postForm.description} onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Cuéntanos sobre esta publicación..." rows={2}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label style={labelStyle}>URL de imagen *</label>
                <input value={postForm.imageUrl} onChange={e => setPostForm({ ...postForm, imageUrl: e.target.value })}
                  placeholder="https://..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Habilidad relacionada (opcional)</label>
                <select value={postForm.skillId} onChange={e => setPostForm({ ...postForm, skillId: e.target.value })}
                  style={inputStyle}>
                  <option value="">Sin habilidad específica</option>
                  {skills.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
              </div>
              {postMsg && <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: postMsg.includes('¡') ? '#15803d' : '#dc2626', textAlign: 'center' }}>{postMsg}</p>}
              <button onClick={handleCreatePost} disabled={postLoading}
                style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: postLoading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: postLoading ? 0.6 : 1 }}>
                {postLoading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          )}

          {postMsg && !showPostForm && (
            <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 600, color: '#15803d', textAlign: 'center' }}>{postMsg}</p>
          )}

          {/* Formulario intercambio */}
          {showExchangeForm && !isOwnProfile && (
            <div style={{ marginTop: 10, background: '#f8fafc', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Nueva solicitud de intercambio</p>
              <div>
                <label style={labelStyle}>Habilidad que quieres aprender *</label>
                <select value={exchangeForm.skillId} onChange={e => setExchangeForm({ ...exchangeForm, skillId: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona una habilidad...</option>
                  {skills.filter(s => s.type === 'offer').map(skill => <option key={skill._id} value={skill._id}>{skill.title}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Duración (horas)</label>
                <input type="number" min={1} max={8} value={exchangeForm.hours}
                  onChange={e => setExchangeForm({ ...exchangeForm, hours: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha y hora *</label>
                <input type="datetime-local" value={exchangeForm.scheduledAt}
                  onChange={e => setExchangeForm({ ...exchangeForm, scheduledAt: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Modalidad</label>
                <select value={exchangeForm.modality} onChange={e => setExchangeForm({ ...exchangeForm, modality: e.target.value })} style={inputStyle}>
                  <option value="virtual">🌐 Virtual</option>
                  <option value="inPerson">📍 Presencial</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mensaje (opcional)</label>
                <textarea value={exchangeForm.message} onChange={e => setExchangeForm({ ...exchangeForm, message: e.target.value })}
                  placeholder="Cuéntale por qué te interesa..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              {exchangeMsg && <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: exchangeMsg.includes('¡') ? '#15803d' : '#dc2626', textAlign: 'center' }}>{exchangeMsg}</p>}
              <button onClick={handleExchange} disabled={exchangeLoading}
                style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: exchangeLoading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: exchangeLoading ? 0.6 : 1 }}>
                {exchangeLoading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          )}

          {exchangeMsg && !showExchangeForm && (
            <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 600, color: '#15803d', textAlign: 'center' }}>{exchangeMsg}</p>
          )}

          {/* Formulario reseña */}
          {showReviewForm && !isOwnProfile && completedExchanges.length > 0 && (
            <div style={{ marginTop: 10, background: '#fffbeb', borderRadius: 16, padding: '16px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Escribir reseña</p>
              <div>
                <label style={labelStyle}>Intercambio completado *</label>
                <select value={reviewForm.exchangeId} onChange={e => setReviewForm({ ...reviewForm, exchangeId: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona un intercambio...</option>
                  {completedExchanges.map(ex => (
                    <option key={ex._id} value={ex._id}>
                      {new Date(ex.scheduledAt).toLocaleDateString('es-CO')} — {ex.hours}h — {ex.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Calificación</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${reviewForm.rating >= n ? '#f59e0b' : '#e2e8f0'}`, background: reviewForm.rating >= n ? '#fef3c7' : '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ⭐
                    </button>
                  ))}
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600, alignSelf: 'center', marginLeft: 4 }}>{reviewForm.rating}/5</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Comentario *</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="¿Cómo fue tu experiencia?" rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              {reviewMsg && <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: reviewMsg.includes('¡') ? '#15803d' : '#dc2626', textAlign: 'center' }}>{reviewMsg}</p>}
              <button onClick={handleCreateReview} disabled={reviewLoading}
                style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: reviewLoading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: reviewLoading ? 0.6 : 1 }}>
                {reviewLoading ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </div>
          )}
        </div>

        {/* Habilidades */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Habilidades</h2>
          {skills.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>No hay habilidades registradas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {skills.map((skill) => (
                <div key={skill._id} style={{ border: '1px solid #f1f5f9', borderRadius: 14, padding: '12px 14px' }}>
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
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{skill.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{skill.description}</p>
                  {skill.type === 'offer' && skill.certificateUrl && (
                    <a href={skill.certificateUrl} target="_blank" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: '#4f46e5', textDecoration: 'none' }}>
                      Ver certificado →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publicaciones */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Publicaciones</h2>
          {posts.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
              {isOwnProfile ? 'Aún no tienes publicaciones. ¡Usa el botón Publicar!' : 'No hay publicaciones todavía'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
              {posts.map((post) => (
                <div key={post._id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reseñas */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Reseñas</h2>
          {reviews.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>No hay reseñas todavía</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((review) => {
                const reviewerUser = allUsers.find((u: any) => u._id === review.reviewerId?.toString());
                const reviewerName = review.reviewerName || reviewerUser?.fullName || 'Usuario';
                const reviewerId = review.reviewerId?.toString();
                return (
                  <div key={review._id} style={{ background: '#f8fafc', borderRadius: 14, padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span onClick={() => reviewerId && router.push(`/profile/${reviewerId}`)}
                        style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline' }}>
                        {reviewerName}
                      </span>
                      <span style={{ fontSize: 13, color: '#f59e0b' }}>{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}