'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const features = [
  { icon: '🔄', title: 'Intercambio de habilidades', desc: 'Enseña lo que sabes, aprende lo que quieres. Sin dinero de por medio.' },
  { icon: '⏱️', title: 'Banco de tiempo', desc: 'Cada sesión suma horas a tu saldo. Úsalas cuando quieras.' },
  { icon: '🌐', title: 'Virtual o presencial', desc: 'Coordina sesiones en línea o en persona según tu preferencia.' },
  { icon: '📸', title: 'Feed social', desc: 'Descubre lo que otros comparten y publica tu propio contenido.' },
  { icon: '🏅', title: 'Logros y reputación', desc: 'Sube de nivel, gana medallas y construye tu reputación.' },
  { icon: '⭐', title: 'Valoraciones reales', desc: 'Califica y lee reseñas de personas con quienes has intercambiado.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [hovered, setHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', background: '#050510', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', Arial, sans-serif" }}>

      {/* Cursor glow */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 0,
        left: cursor.x, top: cursor.y,
        width: 420, height: 420,
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)',
        transition: 'left 0.08s, top 0.08s',
        borderRadius: '50%',
      }} />

      {/* Cursor dot */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 50,
        left: cursor.x, top: cursor.y,
        width: 8, height: 8,
        transform: 'translate(-50%,-50%)',
        background: '#4f46e5',
        borderRadius: '50%',
        transition: 'left 0.04s, top 0.04s',
        boxShadow: '0 0 12px rgba(79,70,229,0.9)',
      }} />

      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(79,70,229,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>S</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>SkillSwap</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => router.push('/login')}
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push('/register')}
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, padding: '8px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '100px 32px 60px', textAlign: 'center',
      }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Disponible ahora · Gratis</span>
        </div>

        {/* Título */}
        <h1 style={{ fontSize: 'clamp(38px, 7vw, 76px)', fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -2, lineHeight: 1.05, maxWidth: 820 }}>
          Intercambia habilidades,<br />
          <span style={{ background: 'linear-gradient(135deg,#4f46e5,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            crece junto a otros
          </span>
        </h1>

        {/* Subtítulo */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 0 48px', lineHeight: 1.75 }}>
          Un sistema de trueque basado en tiempo. Enseña lo que sabes, aprende lo que quieres — sin dinero de por medio.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
          <button
            onClick={() => router.push('/register')}
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '14px 38px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(79,70,229,0.45)' }}
          >
            Empezar gratis
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, fontWeight: 600, padding: '14px 38px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            Ya tengo cuenta
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, maxWidth: 900, width: '100%', marginBottom: 64 }}>
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? 'rgba(79,70,229,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered === i ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, padding: '22px 26px', textAlign: 'left', cursor: 'default',
                transition: 'all 0.22s ease',
                transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.2 }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: 600 }}>
          {[['100%', 'Gratuito'], ['⏱️', 'Basado en tiempo'], ['🔄', 'Sin dinero']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}