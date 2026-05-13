import React, { useState, useEffect, useRef } from 'react';
import {
  GitHub, ChevronRight, Search, Check, X, Loader2, GitBranch,
  Globe, Terminal, Settings, Clock, Activity, ArrowLeft,
  Copy, ExternalLink, ChevronDown, AlertCircle, Sparkles,
  Play, RotateCcw, Plus, Filter, Zap, Cpu, HardDrive,
  ArrowRight, Lock, Eye, EyeOff, Box, Layers, Server,
  Circle, Rocket, Moon, Sun, Menu, MoreHorizontal,
CheckCircle, XCircle, FileCode, Folder, Shield
} from 'lucide-react';

/* =========================================================
   BLUEHOST CONNECTED DEPLOYMENTS — Interactive Prototype
   Screens: Empty → Connect GitHub → Pick Repo → Detect Framework
            → Deploying → Live → Dashboard → Logs → Settings
   ========================================================= */

const COLORS = {
  // Calm developer surface, Bluehost blue used surgically
  bg: '#0A0B0D',
  bgPanel: '#101216',
  bgRaised: '#16191F',
  border: '#22262E',
  borderStrong: '#2E333D',
  text: '#E8EAED',
  textDim: '#8B92A0',
  textFaint: '#5A6170',
  brand: '#2B6CFF',        // Bluehost blue, used sparingly
  brandSoft: 'rgba(43,108,255,0.12)',
  accent: '#3DDC97',       // signal green for "live"
  warn: '#FFB547',
  error: '#FF5A5F',
  errorSoft: 'rgba(255,90,95,0.12)',
};

// ---------- Reusable bits ----------

const Btn = ({ children, variant='primary', size='md', icon, onClick, disabled, full }) => {
  const styles = {
    primary:   { bg: COLORS.brand, color: '#fff', border: COLORS.brand, hover: '#1f5be0' },
    secondary: { bg: 'transparent', color: COLORS.text, border: COLORS.borderStrong, hover: COLORS.bgRaised },
    ghost:     { bg: 'transparent', color: COLORS.textDim, border: 'transparent', hover: COLORS.bgRaised },
    danger:    { bg: 'transparent', color: COLORS.error, border: COLORS.borderStrong, hover: COLORS.errorSoft },
    accent:    { bg: COLORS.accent, color: '#062018', border: COLORS.accent, hover: '#2bc485' },
  }[variant];
  const padding = size === 'sm' ? '6px 10px' : size === 'lg' ? '12px 20px' : '8px 14px';
  const fontSize = size === 'sm' ? 12.5 : size === 'lg' ? 14.5 : 13.5;
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding, fontSize, fontWeight: 500, letterSpacing: '-0.005em',
        background: disabled ? COLORS.bgRaised : (hover ? styles.hover : styles.bg),
        color: disabled ? COLORS.textFaint : styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: 7,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 120ms ease',
        width: full ? '100%' : undefined,
        justifyContent: full ? 'center' : undefined,
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {children}
    </button>
  );
};

const Badge = ({ children, tone='default', dot }) => {
  const tones = {
    default: { bg: COLORS.bgRaised, color: COLORS.textDim, border: COLORS.border },
    live:    { bg: 'rgba(61,220,151,0.1)', color: COLORS.accent, border: 'rgba(61,220,151,0.25)' },
    building:{ bg: 'rgba(43,108,255,0.1)', color: COLORS.brand, border: 'rgba(43,108,255,0.25)' },
    failed:  { bg: COLORS.errorSoft, color: COLORS.error, border: 'rgba(255,90,95,0.25)' },
    warn:    { bg: 'rgba(255,181,71,0.1)', color: COLORS.warn, border: 'rgba(255,181,71,0.25)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px', fontSize: 11.5, fontWeight: 500,
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
      borderRadius: 100, letterSpacing: '0.01em',
      fontFeatureSettings: '"tnum"',
    }}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: 100, background: t.color,
        boxShadow: tone === 'live' ? `0 0 8px ${t.color}` : undefined,
        animation: tone === 'building' ? 'pulse 1.5s infinite' : undefined,
      }} />}
      {children}
    </span>
  );
};

const Panel = ({ children, padding=20, style }) => (
  <div style={{
    background: COLORS.bgPanel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding,
    ...style,
  }}>
    {children}
  </div>
);

// ---------- Top chrome (Bluehost dashboard frame) ----------

const TopBar = ({ activeScreen, onNavHome }) => (
  <div style={{
    height: 52, borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.bg,
    display: 'flex', alignItems: 'center', padding: '0 20px',
    fontSize: 13, position: 'sticky', top: 0, zIndex: 20,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onNavHome}>
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        background: `linear-gradient(135deg, ${COLORS.brand} 0%, #1843a8 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13, color: '#fff',
      }}>b</div>
      <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Bluehost</span>
      <span style={{ color: COLORS.textFaint, fontSize: 12 }}>/</span>
      <span style={{ color: COLORS.textDim }}>Deployments</span>
      {activeScreen && activeScreen !== 'empty' && (
        <>
          <span style={{ color: COLORS.textFaint, fontSize: 12 }}>/</span>
          <span style={{ color: COLORS.text }}>{activeScreen}</span>
        </>
      )}
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: COLORS.textDim }}>
      <span style={{ fontSize: 12.5 }}>Docs</span>
      <span style={{ fontSize: 12.5 }}>Support</span>
      <div style={{
        width: 28, height: 28, borderRadius: 100,
        background: 'linear-gradient(135deg, #6f4cff, #ff4cb3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600, color: '#fff',
      }}>MR</div>
    </div>
  </div>
);

const SideNav = ({ active, onChange }) => {
  const items = [
    { id: 'sites', icon: <Globe size={15}/>, label: 'My Sites' },
    { id: 'deploys', icon: <Rocket size={15}/>, label: 'Deployments', active: true },
    { id: 'domains', icon: <Layers size={15}/>, label: 'Domains' },
    { id: 'email', icon: <Box size={15}/>, label: 'Email' },
    { id: 'billing', icon: <Circle size={15}/>, label: 'Billing' },
  ];
  return (
    <div style={{
      width: 200, borderRight: `1px solid ${COLORS.border}`,
      padding: '20px 12px', background: COLORS.bg,
    }}>
      <div style={{ fontSize: 11, color: COLORS.textFaint, padding: '0 10px 8px',
        textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workspace</div>
      {items.map(it => (
        <div key={it.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 10px', borderRadius: 6,
          color: it.active ? COLORS.text : COLORS.textDim,
          background: it.active ? COLORS.bgRaised : 'transparent',
          fontSize: 13, cursor: 'pointer', marginBottom: 2,
          fontWeight: it.active ? 500 : 400,
        }}>
          {it.icon}
          {it.label}
          {it.id === 'deploys' && <Badge tone="building">new</Badge>}
        </div>
      ))}
    </div>
  );
};

// ============================================================
// SCREEN 1: Empty state
// ============================================================

const EmptyState = ({ onStart }) => (
  <div style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', margin: 0,
          fontFamily: '"Söhne", "Geist", -apple-system, sans-serif' }}>
          Deployments
        </h1>
        <p style={{ color: COLORS.textDim, fontSize: 14, margin: '6px 0 0' }}>
          Deploy from Git. Ship in under three minutes.
        </p>
      </div>
    </div>

    <Panel padding={0} style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '56px 48px 48px', position: 'relative',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(43,108,255,0.08), transparent)`,
      }}>
        {/* Hero diagram */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          {[
            { icon: <Github size={20}/>, label: 'git push' },
            { icon: <Cpu size={20}/>, label: 'build' },
            { icon: <Server size={20}/>, label: 'deploy' },
            { icon: <Globe size={20}/>, label: 'live' },
          ].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: COLORS.bgRaised, border: `1px solid ${COLORS.borderStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 3 ? COLORS.accent : COLORS.text,
                  boxShadow: i === 3 ? `0 0 24px ${COLORS.accent}40` : undefined,
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: 11.5, color: COLORS.textDim, letterSpacing: '0.02em' }}>{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, ${COLORS.borderStrong}, ${COLORS.borderStrong})`,
                  margin: '0 8px', position: 'relative', marginBottom: 22,
                }}>
                  <div style={{
                    position: 'absolute', top: -2, left: 0, height: 5, width: 24,
                    background: `linear-gradient(90deg, transparent, ${COLORS.brand}, transparent)`,
                    animation: `slide 2.4s linear infinite`,
                    animationDelay: `${i * 0.6}s`,
                  }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 10px',
            fontFamily: '"Söhne", "Geist", -apple-system, sans-serif',
          }}>
            Ship your first project in under 3 minutes
          </h2>
          <p style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.55, margin: '0 0 24px' }}>
            Connect a GitHub repository, and Bluehost handles the rest — framework detection,
            builds, custom domains, TLS, and automatic redeploys on every push.
          </p>
          <Btn variant="primary" size="lg" icon={<Github size={15}/>} onClick={onStart}>
            Connect GitHub
          </Btn>
          <div style={{ marginTop: 14, fontSize: 12, color: COLORS.textFaint }}>
            Free tier includes 3 projects · 100 build minutes / month
          </div>
        </div>

        {/* trust strip */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        }}>
          {[
            { icon: <Zap size={14}/>, title: 'Zero config', body: 'Auto-detect Next.js, Astro, Vite, Node, and more.' },
            { icon: <RotateCcw size={14}/>, title: 'Instant rollback', body: 'Every deploy is immutable. Roll back in one click.' },
            { icon: <Shield size={14}/>, title: 'Real hosting', body: 'Long-running runtimes. No cold starts. Bundled with your plan.' },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ color: COLORS.brand, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: COLORS.textDim, lineHeight: 1.5 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  </div>
);

// ============================================================
// SCREEN 2: Connect GitHub (OAuth consent preview)
// ============================================================

const ConnectGitHub = ({ onConnect, onBack }) => (
  <div style={{ padding: '40px 32px', maxWidth: 560, margin: '0 auto' }}>
    <button onClick={onBack} style={{
      display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
      color: COLORS.textDim, fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0,
    }}>
      <ArrowLeft size={14}/> Back
    </button>

    <Panel padding={32}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Github size={22} color="#000"/>
        </div>
        <ChevronRight size={16} color={COLORS.textFaint}/>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.brand}, #1843a8)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#fff',
        }}>b</div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.015em' }}>
        Connect your GitHub account
      </h2>
      <p style={{ color: COLORS.textDim, fontSize: 13.5, lineHeight: 1.55, margin: '0 0 24px' }}>
        Bluehost will use your account to read repositories you select and listen for pushes.
        You can revoke access anytime in GitHub settings.
      </p>

      <div style={{
        background: COLORS.bgRaised, borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: 16, marginBottom: 24,
      }}>
        <div style={{ fontSize: 11.5, color: COLORS.textFaint, textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: 12 }}>
          Permissions requested
        </div>
        {[
          { label: 'Read repository contents', body: 'Clone code to build your project.' },
          { label: 'Read commit metadata', body: 'Show author, message, and SHA in deploy history.' },
          { label: 'Manage webhooks', body: 'Listen for pushes to auto-deploy.' },
        ].map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            paddingTop: i === 0 ? 0 : 12,
            paddingBottom: i === 2 ? 0 : 12,
            borderBottom: i < 2 ? `1px solid ${COLORS.border}` : 'none',
          }}>
            <Check size={15} color={COLORS.accent} style={{ marginTop: 2 }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>{p.body}</div>
            </div>
          </div>
        ))}
      </div>

      <Btn variant="primary" full icon={<Github size={15}/>} onClick={onConnect}>
        Continue with GitHub
      </Btn>
      <div style={{ marginTop: 14, fontSize: 11.5, color: COLORS.textFaint, textAlign: 'center' }}>
        <Lock size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>
        Bluehost will use the GitHub App (least-privilege) for production accounts.
      </div>
    </Panel>
  </div>
);

// ============================================================
// SCREEN 3: Repository Picker
// ============================================================

const REPOS = [
  { name: 'maya-portfolio', desc: 'Personal site built with Next.js', lang: 'TypeScript', langColor: '#3178c6', updated: '2 hours ago', private: false },
  { name: 'side-project-saas', desc: 'Schedule-by-link tool, early prototype', lang: 'TypeScript', langColor: '#3178c6', updated: 'yesterday', private: true },
  { name: 'recipes-astro', desc: 'Static recipe collection, image-heavy', lang: 'Astro', langColor: '#ff5d01', updated: '3 days ago', private: false },
  { name: 'hvac-marketing-site', desc: 'Client work — Tomás HVAC, Next.js app router', lang: 'TypeScript', langColor: '#3178c6', updated: '5 days ago', private: true },
  { name: 'design-system', desc: 'React components, shared internal lib', lang: 'TypeScript', langColor: '#3178c6', updated: 'last week', private: true },
  { name: 'old-jekyll-blog', desc: 'Personal blog, retiring soon', lang: 'Ruby', langColor: '#701516', updated: '6 months ago', private: false },
];

const RepoPicker = ({ onPick, onBack }) => {
  const [q, setQ] = useState('');
  const filtered = REPOS.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '32px 32px', maxWidth: 720, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: COLORS.textDim, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={14}/> Back
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Select a repository
        </h2>
        <p style={{ color: COLORS.textDim, fontSize: 13.5, margin: 0 }}>
          Connected as <span style={{ color: COLORS.text }}>@maya-r</span>.
          Don't see a repo? <span style={{ color: COLORS.brand, cursor: 'pointer' }}>Adjust GitHub App access →</span>
        </p>
      </div>

      <Panel padding={0}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <Search size={15} color={COLORS.textFaint}/>
          <input
            placeholder="Search repositories..."
            value={q} onChange={e => setQ(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: COLORS.text, fontSize: 13.5, fontFamily: 'inherit',
            }}
          />
          <Btn variant="ghost" size="sm" icon={<Filter size={13}/>}>Filter</Btn>
        </div>
        <div style={{ maxHeight: 440, overflowY: 'auto' }}>
          {filtered.map((r, i) => (
            <div
              key={r.name}
              onClick={() => onPick(r)}
              style={{
                padding: '14px 16px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                cursor: 'pointer', transition: 'background 120ms',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.bgRaised}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.textDim, fontSize: 12, fontWeight: 600,
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                {r.name.slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '-0.005em' }}>{r.name}</span>
                  {r.private && <Badge>private</Badge>}
                </div>
                <div style={{ fontSize: 12.5, color: COLORS.textDim, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: COLORS.textFaint, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 100, background: r.langColor }}/>
                  {r.lang}
                </div>
                <span>{r.updated}</span>
                <ChevronRight size={14}/>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: COLORS.textDim, fontSize: 13 }}>
              No repositories match "{q}".
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};

// ============================================================
// SCREEN 4: Framework Detection
// ============================================================

const FrameworkDetect = ({ repo, onDeploy, onBack }) => {
  const [advanced, setAdvanced] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [showVal, setShowVal] = useState({});

  return (
    <div style={{ padding: '32px 32px', maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: COLORS.textDim, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={14}/> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Configure your deployment
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textDim, fontSize: 13 }}>
            <Github size={13}/>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>maya-r/{repo?.name || 'maya-portfolio'}</span>
            <span style={{ color: COLORS.textFaint }}>·</span>
            <GitBranch size={12}/>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>main</span>
          </div>
        </div>
      </div>

      {/* Detection banner */}
      <Panel padding={16} style={{
        marginBottom: 16,
        background: 'linear-gradient(180deg, rgba(43,108,255,0.06), transparent)',
        borderColor: 'rgba(43,108,255,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: COLORS.brandSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(43,108,255,0.3)',
          }}>
            <Sparkles size={16} color={COLORS.brand}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>
              Detected <span style={{ color: COLORS.brand }}>Next.js 14</span>
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.textDim, marginTop: 2 }}>
              We picked sensible defaults. Adjust below if you need to.
            </div>
          </div>
          <Badge tone="building" dot>auto-detected</Badge>
        </div>
      </Panel>

      {/* Config form */}
      <Panel padding={0}>
        {[
          { label: 'Project name', value: repo?.name || 'maya-portfolio',
            sub: 'Used in your default URL.', mono: true,
            suffix: '.bluehost.app' },
          { label: 'Framework preset', value: 'Next.js', sub: 'Build target and runtime.' },
          { label: 'Build command', value: 'next build', sub: 'Runs in your project root.', mono: true },
          { label: 'Output directory', value: '.next', sub: 'Built artifacts location.', mono: true },
          { label: 'Install command', value: 'npm install', sub: 'Detected from lockfile.', mono: true },
          { label: 'Node version', value: '20.x', sub: 'Override in .nvmrc or here.' },
        ].map((row, i, arr) => (
          <div key={i} style={{
            padding: '14px 18px',
            borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none',
            display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{row.label}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>{row.sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
                borderRadius: 6, padding: '7px 10px', fontSize: 12.5,
                fontFamily: row.mono ? '"JetBrains Mono", monospace' : 'inherit',
                color: COLORS.text,
              }}>
                {row.value}
                {row.suffix && <span style={{ color: COLORS.textFaint, marginLeft: 0 }}>{row.suffix}</span>}
              </div>
            </div>
          </div>
        ))}
      </Panel>

      {/* Advanced */}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setAdvanced(!advanced)} style={{
          background: 'none', border: 'none', color: COLORS.textDim, fontSize: 13,
          cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit',
        }}>
          <ChevronDown size={14} style={{ transform: advanced ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms' }}/>
          Advanced settings (environment variables, root directory)
        </button>

        {advanced && (
          <Panel padding={18} style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, color: COLORS.textDim,
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Environment variables
            </div>
            {envVars.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: 8, marginBottom: 8 }}>
                <input placeholder="KEY" value={v.key}
                  onChange={e => { const n=[...envVars]; n[i].key=e.target.value; setEnvVars(n);}}
                  style={inputStyle}/>
                <div style={{ position: 'relative' }}>
                  <input placeholder="value" type={showVal[i] ? 'text' : 'password'} value={v.value}
                    onChange={e => { const n=[...envVars]; n[i].value=e.target.value; setEnvVars(n);}}
                    style={{ ...inputStyle, paddingRight: 32, width: '100%', boxSizing: 'border-box' }}/>
                  <button onClick={() => setShowVal({...showVal, [i]: !showVal[i]})}
                    style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none',
                      cursor: 'pointer', color: COLORS.textFaint }}>
                    {showVal[i] ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                </div>
                <Btn variant="ghost" size="sm" icon={<X size={13}/>}
                  onClick={() => setEnvVars(envVars.filter((_, j) => j !== i))}/>
              </div>
            ))}
            <Btn variant="ghost" size="sm" icon={<Plus size={13}/>}
              onClick={() => setEnvVars([...envVars, { key:'', value:'' }])}>
              Add variable
            </Btn>
            <div style={{ marginTop: 12, fontSize: 11.5, color: COLORS.textFaint,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={11}/> Encrypted at rest. Injected at build and runtime.
            </div>
          </Panel>
        )}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" onClick={onBack}>Cancel</Btn>
        <Btn variant="primary" icon={<Rocket size={14}/>} onClick={onDeploy}>Deploy</Btn>
      </div>
    </div>
  );
};

const inputStyle = {
  background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
  borderRadius: 6, padding: '7px 10px', fontSize: 12.5,
  fontFamily: '"JetBrains Mono", monospace', color: COLORS.text,
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

// ============================================================
// SCREEN 5: Deploying (real-time stream)
// ============================================================

const STAGES = [
  { id: 'clone', label: 'Cloning repository', detail: 'Fetching latest from main' },
  { id: 'detect', label: 'Detecting framework', detail: 'Reading package.json' },
  { id: 'install', label: 'Installing dependencies', detail: '847 packages' },
  { id: 'build', label: 'Running build', detail: 'next build' },
  { id: 'upload', label: 'Uploading artifacts', detail: '4.2 MB compressed' },
  { id: 'deploy', label: 'Going live', detail: 'Activating new artifact' },
];

const LOG_LINES = [
  { stage: 'clone', text: '$ git clone --depth=1 git@github.com:maya-r/maya-portfolio.git', t: 0 },
  { stage: 'clone', text: 'Cloning into \'maya-portfolio\'...', t: 200 },
  { stage: 'clone', text: 'Receiving objects: 100% (482/482), 1.2 MiB | 18.4 MiB/s, done.', t: 800 },
  { stage: 'detect', text: '→ Detected Next.js 14.2.5', t: 1100 },
  { stage: 'detect', text: '→ Node 20.11.0 selected from .nvmrc', t: 1250 },
  { stage: 'install', text: '$ npm install', t: 1500 },
  { stage: 'install', text: 'added 847 packages in 12s', t: 4500 },
  { stage: 'build', text: '$ next build', t: 4700 },
  { stage: 'build', text: '  ▲ Next.js 14.2.5', t: 5000 },
  { stage: 'build', text: '   Creating an optimized production build ...', t: 5400 },
  { stage: 'build', text: ' ✓ Compiled successfully', t: 8200 },
  { stage: 'build', text: ' ✓ Collecting page data', t: 8500 },
  { stage: 'build', text: ' ✓ Generating static pages (12/12)', t: 9100 },
  { stage: 'upload', text: '→ Packaging artifact', t: 9400 },
  { stage: 'upload', text: '→ Pushed artifact d-9c3f8a (4.2 MB)', t: 10100 },
  { stage: 'deploy', text: '→ Activating artifact d-9c3f8a', t: 10400 },
  { stage: 'deploy', text: '→ Healthcheck OK (124 ms)', t: 10900 },
  { stage: 'deploy', text: '✓ Live at https://maya-portfolio.bluehost.app', t: 11200 },
];

const TOTAL_MS = 11500;

const Deploying = ({ onDone }) => {
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const e = Date.now() - startRef.current;
      setElapsed(e);
      const visible = LOG_LINES.filter(l => l.t <= e);
      setLogs(visible);
      if (e >= TOTAL_MS) {
        clearInterval(id);
        setTimeout(onDone, 800);
      }
    };
    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, [onDone]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs.length]);

  // determine current stage
  const stageProgress = STAGES.map(s => {
    const lines = LOG_LINES.filter(l => l.stage === s.id);
    const lastLineT = Math.max(...lines.map(l => l.t));
    const firstLineT = Math.min(...lines.map(l => l.t));
    if (elapsed >= lastLineT) return 'done';
    if (elapsed >= firstLineT) return 'active';
    return 'pending';
  });

  const overallPct = Math.min(100, (elapsed / TOTAL_MS) * 100);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 920, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Badge tone="building" dot>Building</Badge>
          <span style={{ fontSize: 12.5, color: COLORS.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
            deploy d-9c3f8a · commit 2a4f1c · main
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Deploying maya-portfolio
        </h2>
        <div style={{ fontSize: 13, color: COLORS.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
          {(elapsed / 1000).toFixed(1)}s elapsed
        </div>
      </div>

      {/* progress bar */}
      <div style={{
        height: 3, background: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{
          height: '100%', width: `${overallPct}%`,
          background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.accent})`,
          transition: 'width 180ms ease',
        }}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Stages */}
        <Panel padding={14}>
          <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 12 }}>Pipeline</div>
          {STAGES.map((s, i) => {
            const state = stageProgress[i];
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0',
                borderBottom: i < STAGES.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <div style={{ marginTop: 2 }}>
                  {state === 'done' && <CheckCircle2 size={15} color={COLORS.accent}/>}
                  {state === 'active' && <Loader2 size={15} color={COLORS.brand} className="spin"/>}
                  {state === 'pending' && <div style={{
                    width: 13, height: 13, borderRadius: 100,
                    border: `1.5px solid ${COLORS.border}`, marginTop: 1, marginLeft: 1,
                  }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500,
                    color: state === 'pending' ? COLORS.textFaint : COLORS.text }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 1,
                    fontFamily: '"JetBrains Mono", monospace' }}>
                    {s.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </Panel>

        {/* Log stream */}
        <Panel padding={0} style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '10px 14px', borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: COLORS.bg,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={13} color={COLORS.textDim}/>
              <span style={{ fontSize: 12.5, color: COLORS.textDim }}>Build log</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.textFaint, fontSize: 11 }}>
              <span>auto-scroll</span>
              <Copy size={12} style={{ cursor: 'pointer' }}/>
            </div>
          </div>
          <div ref={logRef} style={{
            height: 360, overflow: 'auto', padding: '12px 14px',
            fontFamily: '"JetBrains Mono", "SF Mono", monospace',
            fontSize: 12, lineHeight: 1.55,
            background: '#08090B',
          }}>
            {logs.map((l, i) => (
              <div key={i} style={{
                color: l.text.startsWith('$') ? COLORS.brand
                  : l.text.includes('✓ Live') ? COLORS.accent
                  : l.text.startsWith('→') ? COLORS.text
                  : l.text.startsWith(' ✓') ? COLORS.accent
                  : COLORS.textDim,
                whiteSpace: 'pre',
              }}>
                <span style={{ color: COLORS.textFaint, marginRight: 12 }}>
                  {String(Math.floor(l.t/1000)).padStart(2,'0')}:{String(Math.floor((l.t%1000)/10)).padStart(2,'0')}
                </span>
                {l.text}
              </div>
            ))}
            {elapsed < TOTAL_MS && <span style={{
              display: 'inline-block', width: 7, height: 13, background: COLORS.brand,
              animation: 'blink 1s infinite', marginLeft: 2, verticalAlign: -2,
            }}/>}
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ============================================================
// SCREEN 6: Deploy Success
// ============================================================

const Success = ({ onContinue }) => {
  const [copied, setCopied] = useState(false);
  const url = 'https://maya-portfolio.bluehost.app';
  return (
    <div style={{ padding: '40px 32px', maxWidth: 640, margin: '0 auto' }}>
      <Panel padding={36}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(61,220,151,0.12)', border: '1px solid rgba(61,220,151,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: `0 0 32px ${COLORS.accent}30`,
        }}>
          <Check size={28} color={COLORS.accent} strokeWidth={2.5}/>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Your project is live.
        </h2>
        <p style={{ color: COLORS.textDim, fontSize: 14, margin: '0 0 24px', lineHeight: 1.55 }}>
          Built in 11.4 seconds. Every future push to <span style={{
            fontFamily: '"JetBrains Mono", monospace', color: COLORS.text
          }}>main</span> will redeploy automatically.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 16,
        }}>
          <Globe size={14} color={COLORS.accent}/>
          <span style={{ flex: 1, fontSize: 13, fontFamily: '"JetBrains Mono", monospace',
            color: COLORS.text }}>
            {url}
          </span>
          <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 1500); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: COLORS.textDim, padding: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5 }}>
            {copied ? <><Check size={12}/> copied</> : <><Copy size={12}/> copy</>}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: COLORS.textDim, padding: 4 }}>
            <ExternalLink size={13}/>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          <Btn variant="secondary" icon={<Globe size={13}/>} full>Add custom domain</Btn>
          <Btn variant="secondary" icon={<Plus size={13}/>} full>Invite teammate</Btn>
        </div>

        <Btn variant="primary" full onClick={onContinue}>
          Go to project dashboard
        </Btn>

        <div style={{
          marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {[
            { label: 'Build time', value: '11.4s' },
            { label: 'Bundle size', value: '4.2 MB' },
            { label: 'Region', value: 'us-east-1' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: 'uppercase',
                letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4,
                fontFamily: '"JetBrains Mono", monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

// ============================================================
// SCREEN 7: Project Dashboard
// ============================================================

const DEPLOY_HISTORY = [
  { id: 'd-9c3f8a', sha: '2a4f1c', msg: 'Update hero typography', branch: 'main', author: 'maya-r', time: '2 min ago', duration: '11.4s', status: 'live' },
  { id: 'd-8d2a1e', sha: '9e1bc3', msg: 'Add case studies section', branch: 'main', author: 'maya-r', time: '4 hours ago', duration: '10.8s', status: 'ready' },
  { id: 'd-7c91f3', sha: '4f2d8a', msg: 'Fix metadata on /about', branch: 'main', author: 'maya-r', time: 'yesterday', duration: '12.1s', status: 'ready' },
  { id: 'd-6b80e2', sha: '1a9c4b', msg: 'Wire contact form to Resend', branch: 'main', author: 'maya-r', time: 'yesterday', duration: '11.9s', status: 'failed' },
  { id: 'd-5a79d1', sha: 'c83be1', msg: 'Initial project setup', branch: 'main', author: 'maya-r', time: '3 days ago', duration: '14.2s', status: 'ready' },
];

const Dashboard = ({ onLogs, onSettings, onNewDeploy }) => {
  const [tab, setTab] = useState('overview');
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              maya-portfolio
            </h1>
            <Badge tone="live" dot>Live</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.textDim, fontSize: 13 }}>
            <Github size={13}/>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>maya-r/maya-portfolio</span>
            <span style={{ color: COLORS.textFaint }}>·</span>
            <Globe size={13}/>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', color: COLORS.brand, cursor: 'pointer' }}>
              maya-portfolio.bluehost.app
            </span>
            <ExternalLink size={11} color={COLORS.brand} style={{ cursor: 'pointer' }}/>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={<RotateCcw size={13}/>}>Redeploy</Btn>
          <Btn variant="secondary" size="sm" icon={<Settings size={13}/>} onClick={onSettings}>Settings</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 24, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 24,
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'deploys', label: 'Deployments', count: 5 },
          { id: 'logs', label: 'Logs' },
          { id: 'activity', label: 'Activity' },
          { id: 'settings', label: 'Settings' },
        ].map(t => (
          <button key={t.id} onClick={() => {
            if (t.id === 'logs') onLogs();
            else if (t.id === 'settings') onSettings();
            else setTab(t.id);
          }} style={{
            background: 'none', border: 'none', padding: '10px 0',
            borderBottom: tab === t.id ? `2px solid ${COLORS.text}` : '2px solid transparent',
            color: tab === t.id ? COLORS.text : COLORS.textDim,
            cursor: 'pointer', fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            marginBottom: -1,
          }}>
            {t.label}
            {t.count && <span style={{ fontSize: 11, color: COLORS.textFaint,
              background: COLORS.bgRaised, padding: '1px 6px', borderRadius: 100 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Current deploy card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <Panel padding={20}>
          <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 12 }}>Current production</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Badge tone="live" dot>Live</Badge>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: COLORS.text }}>
              d-9c3f8a
            </span>
            <span style={{ color: COLORS.textFaint, fontSize: 12.5 }}>2 minutes ago</span>
          </div>
          <div style={{ fontSize: 14.5, marginBottom: 4 }}>Update hero typography</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.textDim, fontSize: 12.5 }}>
            <GitBranch size={12}/>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>main</span>
            <span style={{ color: COLORS.textFaint }}>·</span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>2a4f1c</span>
            <span style={{ color: COLORS.textFaint }}>·</span>
            <span>by maya-r</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Btn variant="secondary" size="sm" icon={<ExternalLink size={12}/>}>Visit</Btn>
            <Btn variant="ghost" size="sm" icon={<Terminal size={12}/>} onClick={onLogs}>View logs</Btn>
          </div>
        </Panel>

        <Panel padding={20}>
          <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 14 }}>This week</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Deploys', value: '12', delta: '+3' },
              { label: 'Avg build', value: '11.6s', delta: '-0.4s' },
              { label: 'Success rate', value: '92%', delta: '0' },
              { label: 'Bandwidth', value: '2.4 GB', delta: '+18%' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 500,
                    fontFamily: '"JetBrains Mono", monospace' }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: s.delta.startsWith('+') ? COLORS.accent :
                    s.delta.startsWith('-') && s.label !== 'Avg build' ? COLORS.error :
                    s.label === 'Avg build' ? COLORS.accent : COLORS.textFaint,
                    fontFamily: '"JetBrains Mono", monospace' }}>{s.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* History */}
      <Panel padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recent deployments</div>
          <Btn variant="ghost" size="sm" icon={<Filter size={12}/>}>All branches</Btn>
        </div>
        {DEPLOY_HISTORY.map((d, i) => (
          <div key={d.id} style={{
            padding: '14px 18px',
            borderBottom: i < DEPLOY_HISTORY.length - 1 ? `1px solid ${COLORS.border}` : 'none',
            display: 'grid', gridTemplateColumns: '90px 1.6fr 1fr 100px 80px 30px', gap: 14,
            alignItems: 'center', fontSize: 12.5,
          }}>
            <Badge tone={d.status === 'live' ? 'live' : d.status === 'failed' ? 'failed' : 'default'} dot={d.status==='live'}>
              {d.status === 'live' ? 'Live' : d.status === 'failed' ? 'Failed' : 'Ready'}
            </Badge>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' }}>{d.msg}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
                {d.id} · {d.sha}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.textDim }}>
              <GitBranch size={11}/>
              <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{d.branch}</span>
              <span style={{ color: COLORS.textFaint }}>·</span>
              <span>{d.author}</span>
            </div>
            <div style={{ color: COLORS.textDim }}>{d.time}</div>
            <div style={{ color: COLORS.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>{d.duration}</div>
            <MoreHorizontal size={14} color={COLORS.textFaint} style={{ cursor: 'pointer' }}/>
          </div>
        ))}
      </Panel>
    </div>
  );
};

// ============================================================
// SCREEN 8: Logs Viewer (failed build with AI explain)
// ============================================================

const FAILED_LOGS = [
  { t: '00:00', text: '$ git clone --depth=1 ...', color: COLORS.brand },
  { t: '00:01', text: 'Cloning into \'maya-portfolio\'...', color: COLORS.textDim },
  { t: '00:02', text: '→ Detected Next.js 14.2.5', color: COLORS.text },
  { t: '00:02', text: '→ Node 20.11.0 selected from .nvmrc', color: COLORS.text },
  { t: '00:03', text: '$ npm install', color: COLORS.brand },
  { t: '00:14', text: 'added 847 packages in 11s', color: COLORS.textDim },
  { t: '00:14', text: '$ next build', color: COLORS.brand },
  { t: '00:15', text: '  ▲ Next.js 14.2.5', color: COLORS.textDim },
  { t: '00:15', text: '   Creating an optimized production build ...', color: COLORS.textDim },
  { t: '00:18', text: ' ⨯ Failed to compile.', color: COLORS.error },
  { t: '00:18', text: '', color: COLORS.text },
  { t: '00:18', text: './app/components/ContactForm.tsx', color: COLORS.warn },
  { t: '00:18', text: 'Type error: Property \'send\' does not exist on type \'Resend\'.', color: COLORS.error },
  { t: '00:18', text: '', color: COLORS.text },
  { t: '00:18', text: '  23 |   const resend = new Resend(process.env.RESEND_API_KEY);', color: COLORS.textDim },
  { t: '00:18', text: '  24 |   try {', color: COLORS.textDim },
  { t: '00:18', text: '> 25 |     await resend.send({', color: COLORS.text },
  { t: '00:18', text: '     |                  ^', color: COLORS.error },
  { t: '00:18', text: '  26 |       from: \'noreply@maya.dev\',', color: COLORS.textDim },
  { t: '00:18', text: '  27 |       to: data.email,', color: COLORS.textDim },
  { t: '00:18', text: '', color: COLORS.text },
  { t: '00:18', text: '✗ Build failed in 18.2s', color: COLORS.error },
];

const LogsView = ({ onBack }) => {
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [tab, setTab] = useState('build');

  const askAI = () => {
    setAILoading(true);
    setShowAI(true);
    setTimeout(() => setAILoading(false), 1400);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1180, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: COLORS.textDim, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={14}/> Back to project
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Badge tone="failed" dot>Failed</Badge>
            <span style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', color: COLORS.textDim }}>
              d-6b80e2 · commit 1a9c4b
            </span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
            Wire contact form to Resend
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={<RotateCcw size={13}/>}>Retry deploy</Btn>
          <Btn variant="primary" size="sm" icon={<Sparkles size={13}/>} onClick={askAI}>
            Ask AI to explain
          </Btn>
        </div>
      </div>

      {/* AI panel */}
      {showAI && (
        <Panel padding={18} style={{
          marginBottom: 16,
          background: 'linear-gradient(180deg, rgba(43,108,255,0.05), transparent)',
          borderColor: 'rgba(43,108,255,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: COLORS.brandSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles size={15} color={COLORS.brand}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.brand,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                AI explanation {aiLoading && <Loader2 size={11} className="spin" style={{verticalAlign:-1, marginLeft:4}}/>}
              </div>
              {aiLoading ? (
                <div style={{ color: COLORS.textDim, fontSize: 13 }}>Analyzing the build error and recent commits…</div>
              ) : (
                <>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.text }}>
                    The build failed because <code style={codeStyle}>resend.send()</code> doesn't exist
                    on the <code style={codeStyle}>Resend</code> client in v3+ of the SDK. The method was
                    renamed to <code style={codeStyle}>resend.emails.send()</code>. Your <code style={codeStyle}>package.json</code> upgraded
                    from <code style={codeStyle}>resend@2.1.0</code> to <code style={codeStyle}>resend@3.2.0</code> in
                    this commit, which is the breaking change.
                  </div>
                  <div style={{
                    marginTop: 14, padding: 12, background: '#08090B',
                    border: `1px solid ${COLORS.border}`, borderRadius: 8,
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 12, lineHeight: 1.55,
                  }}>
                    <div style={{ color: COLORS.error }}>- await resend.send({'{'}</div>
                    <div style={{ color: COLORS.accent }}>+ await resend.emails.send({'{'}</div>
                    <div style={{ color: COLORS.textDim }}>    from: 'noreply@maya.dev',</div>
                    <div style={{ color: COLORS.textDim }}>    to: data.email,</div>
                    <div style={{ color: COLORS.textDim }}>  {'}'})</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <Btn variant="primary" size="sm" icon={<Github size={12}/>}>
                      Open fix PR on GitHub
                    </Btn>
                    <Btn variant="secondary" size="sm">View diff</Btn>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textFaint }}>
                    Confidence: high · Source: Resend changelog, your package.json diff
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setShowAI(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textFaint, padding: 4,
            }}><X size={14}/></button>
          </div>
        </Panel>
      )}

      {/* Log tabs */}
      <Panel padding={0}>
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { id: 'build', label: 'Build log', icon: <Cpu size={12}/> },
              { id: 'runtime', label: 'Runtime log', icon: <Server size={12}/> },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer',
                color: tab === t.id ? COLORS.text : COLORS.textDim, fontSize: 12.5,
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
                borderBottom: tab === t.id ? `1.5px solid ${COLORS.text}` : '1.5px solid transparent',
              }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: COLORS.textFaint }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
              borderRadius: 6, padding: '4px 8px' }}>
              <Search size={11}/>
              <input placeholder="filter logs..." style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11.5, color: COLORS.text, fontFamily: 'inherit', width: 140,
              }}/>
            </div>
            <Copy size={13} style={{ cursor: 'pointer' }}/>
          </div>
        </div>
        <div style={{
          height: 440, overflow: 'auto', padding: '12px 16px',
          fontFamily: '"JetBrains Mono", "SF Mono", monospace',
          fontSize: 12, lineHeight: 1.6, background: '#08090B',
        }}>
          {FAILED_LOGS.map((l, i) => (
            <div key={i} style={{ color: l.color, whiteSpace: 'pre' }}>
              {l.text && <span style={{ color: COLORS.textFaint, marginRight: 12 }}>{l.t}</span>}
              {l.text}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

const codeStyle = {
  background: COLORS.bgRaised, border: `1px solid ${COLORS.border}`,
  padding: '1px 5px', borderRadius: 4, fontSize: '0.92em',
  fontFamily: '"JetBrains Mono", monospace', color: COLORS.brand,
};

// ============================================================
// SCREEN 9: Settings (env vars, domains, git)
// ============================================================

const Settings_ = ({ onBack }) => {
  const [section, setSection] = useState('env');
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1080, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: COLORS.textDim, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={14}/> Back to maya-portfolio
      </button>

      <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Project settings
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <div>
          {[
            { id: 'git', label: 'Git', icon: <Github size={13}/> },
            { id: 'build', label: 'Build & runtime', icon: <Cpu size={13}/> },
            { id: 'env', label: 'Environment variables', icon: <Lock size={13}/> },
            { id: 'domains', label: 'Domains', icon: <Globe size={13}/> },
            { id: 'danger', label: 'Danger zone', icon: <AlertCircle size={13}/> },
          ].map(s => (
            <div key={s.id} onClick={() => setSection(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 6, marginBottom: 2, cursor: 'pointer', fontSize: 13,
              color: section === s.id ? COLORS.text : COLORS.textDim,
              background: section === s.id ? COLORS.bgRaised : 'transparent',
            }}>
              {s.icon}{s.label}
            </div>
          ))}
        </div>

        <div>
          {section === 'env' && <EnvVarsSection/>}
          {section === 'domains' && <DomainsSection/>}
          {section === 'git' && <GitSection/>}
          {section === 'build' && <BuildSection/>}
          {section === 'danger' && <DangerSection/>}
        </div>
      </div>
    </div>
  );
};

const EnvVarsSection = () => {
  const vars = [
    { k: 'DATABASE_URL', masked: true, env: 'Production' },
    { k: 'RESEND_API_KEY', masked: true, env: 'Production' },
    { k: 'NEXT_PUBLIC_SITE_URL', val: 'https://maya-portfolio.bluehost.app', env: 'All' },
    { k: 'NODE_ENV', val: 'production', env: 'Production' },
  ];
  return (
    <Panel padding={0}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Environment variables</div>
        <div style={{ fontSize: 12.5, color: COLORS.textDim }}>
          Encrypted at rest. Injected at build and runtime. Changes redeploy automatically.
        </div>
      </div>
      {vars.map((v, i) => (
        <div key={v.k} style={{
          padding: '12px 20px', display: 'grid',
          gridTemplateColumns: '1.2fr 2fr 100px 30px', gap: 14, alignItems: 'center',
          borderBottom: i < vars.length - 1 ? `1px solid ${COLORS.border}` : 'none',
        }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, color: COLORS.text }}>{v.k}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, color: COLORS.textDim }}>
            {v.masked ? '••••••••••••••••••' : v.val}
          </div>
          <Badge>{v.env}</Badge>
          <MoreHorizontal size={14} color={COLORS.textFaint} style={{ cursor: 'pointer' }}/>
        </div>
      ))}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${COLORS.border}` }}>
        <Btn variant="secondary" size="sm" icon={<Plus size={12}/>}>Add variable</Btn>
      </div>
    </Panel>
  );
};

const DomainsSection = () => (
  <Panel padding={0}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Domains</div>
      <div style={{ fontSize: 12.5, color: COLORS.textDim }}>
        Connect a custom domain. TLS certificates issue automatically.
      </div>
    </div>
    {[
      { domain: 'maya-portfolio.bluehost.app', type: 'Default', status: 'live' },
      { domain: 'maya.dev', type: 'Custom · Primary', status: 'live' },
      { domain: 'www.maya.dev', type: 'Custom · Redirect to maya.dev', status: 'live' },
      { domain: 'beta.maya.dev', type: 'Custom', status: 'pending' },
    ].map((d, i, arr) => (
      <div key={d.domain} style={{
        padding: '14px 20px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 100px 30px',
        gap: 14, alignItems: 'center',
        borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none',
      }}>
        <div>
          <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace' }}>{d.domain}</div>
          <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>{d.type}</div>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={12} color={d.status === 'live' ? COLORS.accent : COLORS.warn}/>
          {d.status === 'live' ? 'TLS active' : 'TLS issuing...'}
        </div>
        <Badge tone={d.status === 'live' ? 'live' : 'warn'} dot>{d.status === 'live' ? 'Live' : 'Pending DNS'}</Badge>
        <MoreHorizontal size={14} color={COLORS.textFaint} style={{ cursor: 'pointer' }}/>
      </div>
    ))}
    <div style={{ padding: '14px 20px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8 }}>
      <Btn variant="secondary" size="sm" icon={<Plus size={12}/>}>Add domain</Btn>
      <Btn variant="ghost" size="sm">Buy domain on Bluehost →</Btn>
    </div>
  </Panel>
);

const GitSection = () => (
  <Panel padding={20}>
    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Git integration</div>
    <div style={{ fontSize: 12.5, color: COLORS.textDim, marginBottom: 18 }}>
      Configure how Bluehost listens to your repository.
    </div>
    <div style={{ display: 'grid', gap: 16 }}>
      {[
        { label: 'Repository', value: 'maya-r/maya-portfolio' },
        { label: 'Production branch', value: 'main' },
        { label: 'Auto-deploy', value: 'On every push to main' },
        { label: 'Build on PR', value: 'Disabled (upgrade for preview deploys)' },
      ].map(r => (
        <div key={r.label} style={{
          display: 'grid', gridTemplateColumns: '180px 1fr auto', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 12.5, color: COLORS.textDim }}>{r.label}</div>
          <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace' }}>{r.value}</div>
          <Btn variant="ghost" size="sm">Edit</Btn>
        </div>
      ))}
    </div>
  </Panel>
);

const BuildSection = () => (
  <Panel padding={20}>
    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Build & runtime</div>
    <div style={{ fontSize: 12.5, color: COLORS.textDim, marginBottom: 18 }}>
      How your project is built and served.
    </div>
    {[
      { label: 'Framework', value: 'Next.js 14' },
      { label: 'Build command', value: 'next build' },
      { label: 'Output directory', value: '.next' },
      { label: 'Install command', value: 'npm install' },
      { label: 'Node version', value: '20.x' },
      { label: 'Region', value: 'us-east-1 (Virginia)' },
    ].map(r => (
      <div key={r.label} style={{
        display: 'grid', gridTemplateColumns: '180px 1fr auto', alignItems: 'center', gap: 14,
        padding: '10px 0', borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ fontSize: 12.5, color: COLORS.textDim }}>{r.label}</div>
        <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace' }}>{r.value}</div>
        <Btn variant="ghost" size="sm">Edit</Btn>
      </div>
    ))}
  </Panel>
);

const DangerSection = () => (
  <Panel padding={20} style={{ borderColor: 'rgba(255,90,95,0.2)' }}>
    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Danger zone</div>
    <div style={{ fontSize: 12.5, color: COLORS.textDim, marginBottom: 18 }}>
      Irreversible operations. Tread carefully.
    </div>
    {[
      { label: 'Disconnect Git', body: 'Stop auto-deploys. Existing site stays live.', btn: 'Disconnect' },
      { label: 'Transfer project', body: 'Move to another Bluehost account.', btn: 'Transfer' },
      { label: 'Delete project', body: 'Remove this project and all its deployments. Cannot be undone.', btn: 'Delete' },
    ].map((r, i, arr) => (
      <div key={r.label} style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 14,
        padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
          <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>{r.body}</div>
        </div>
        <Btn variant="danger" size="sm">{r.btn}</Btn>
      </div>
    ))}
  </Panel>
);

// ============================================================
// SCREEN ROUTER
// ============================================================

const SCREENS = [
  { id: 'empty', label: 'Empty state' },
  { id: 'connect', label: 'Connect GitHub' },
  { id: 'picker', label: 'Pick repo' },
  { id: 'detect', label: 'Detect framework' },
  { id: 'deploying', label: 'Deploying' },
  { id: 'success', label: 'Success' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'logs', label: 'Logs (failed + AI)' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [screen, setScreen] = useState('empty');
  const [pickedRepo, setPickedRepo] = useState(null);

  const screenLabel = SCREENS.find(s => s.id === screen)?.label;

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg, color: COLORS.text,
      fontFamily: '"Söhne", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14, fontFeatureSettings: '"ss01", "cv11"',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        @keyframes slide {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(56px); opacity: 0; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 100px; border: 2px solid ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderStrong}; }
      `}</style>

      <TopBar activeScreen={screenLabel} onNavHome={() => setScreen('empty')}/>

      {/* Screen selector strip — keeps the prototype navigable */}
      <div style={{
        background: COLORS.bgPanel, borderBottom: `1px solid ${COLORS.border}`,
        padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8,
        overflowX: 'auto', whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 11, color: COLORS.textFaint, textTransform: 'uppercase',
          letterSpacing: '0.08em', marginRight: 6 }}>Prototype:</span>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={{
            padding: '4px 10px', fontSize: 11.5, borderRadius: 100,
            border: `1px solid ${screen === s.id ? COLORS.borderStrong : COLORS.border}`,
            background: screen === s.id ? COLORS.bgRaised : 'transparent',
            color: screen === s.id ? COLORS.text : COLORS.textDim,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
        <SideNav/>
        <div style={{ flex: 1, minWidth: 0 }}>
          {screen === 'empty' && <EmptyState onStart={() => setScreen('connect')}/>}
          {screen === 'connect' && <ConnectGitHub
            onBack={() => setScreen('empty')}
            onConnect={() => setScreen('picker')}/>}
          {screen === 'picker' && <RepoPicker
            onBack={() => setScreen('connect')}
            onPick={(r) => { setPickedRepo(r); setScreen('detect'); }}/>}
          {screen === 'detect' && <FrameworkDetect
            repo={pickedRepo}
            onBack={() => setScreen('picker')}
            onDeploy={() => setScreen('deploying')}/>}
          {screen === 'deploying' && <Deploying onDone={() => setScreen('success')}/>}
          {screen === 'success' && <Success onContinue={() => setScreen('dashboard')}/>}
          {screen === 'dashboard' && <Dashboard
            onLogs={() => setScreen('logs')}
            onSettings={() => setScreen('settings')}
            onNewDeploy={() => setScreen('detect')}/>}
          {screen === 'logs' && <LogsView onBack={() => setScreen('dashboard')}/>}
          {screen === 'settings' && <Settings_ onBack={() => setScreen('dashboard')}/>}
        </div>
      </div>
    </div>
  );
}
