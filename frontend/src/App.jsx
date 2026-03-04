import { useState, useEffect } from 'react';
import { INDIA_STATES, STATE_CITIES } from './india_data';

/* ═══════════════════════════════════════════════════════════════════════
   GrowthPilot v2 – AI-Based Local Business Growth Engine
   Full Dashboard with Detailed Review Sections
   ═══════════════════════════════════════════════════════════════════════ */

// ── Score Ring ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 140, label = 'SEO Score' }) {
    const r = (size - 16) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    const cls = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : score >= 40 ? 'score-fair' : 'score-poor';

    return (
        <div className={`score-ring ${cls}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle className="bg-ring" cx={size / 2} cy={size / 2} r={r} />
                <circle className="fg-ring" cx={size / 2} cy={size / 2} r={r} strokeDasharray={c} strokeDashoffset={offset} />
            </svg>
            <div className="score-value">
                <span className="score-number">{score}</span>
                <span className="score-label">{label}</span>
            </div>
        </div>
    );
}

// ── Mini Score Badge ────────────────────────────────────────────────────
function ScoreBadge({ score, label }) {
    const color = score >= 80 ? 'var(--gp-accent)' : score >= 60 ? 'var(--gp-info)' : score >= 40 ? 'var(--gp-warning)' : 'var(--gp-danger)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color,
            }}>{score}</div>
            {label && <span style={{ fontSize: '0.82rem', color: 'var(--gp-text-secondary)' }}>{label}</span>}
        </div>
    );
}

// ── Collapsible Card ────────────────────────────────────────────────────
function CollapsibleCard({ title, icon, score, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="card">
            <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
                <div className="card-title">
                    <span className="icon" style={{ background: 'rgba(108,99,255,0.12)' }}>{icon}</span>
                    {title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {score != null && <ScoreBadge score={score} />}
                    <span style={{ fontSize: '1.2rem', color: 'var(--gp-text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </div>
            </div>
            {open && <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>{children}</div>}
        </div>
    );
}

// ── Page Overview Tab ───────────────────────────────────────────────────
function OverviewTab({ scraped, summary, seo }) {
    if (!scraped) return null;
    const og = summary?.og_tags || {};
    const perf = seo?.performance_audit;
    const read = seo?.readability_analysis;

    return (
        <div className="report-section">
            {/* Quick Stats */}
            <div className="stat-grid">
                <div className="stat-card"><div className="stat-value">{summary?.word_count ?? 0}</div><div className="stat-label">Words</div></div>
                <div className="stat-card"><div className="stat-value">{summary?.total_images ?? 0}</div><div className="stat-label">Images</div></div>
                <div className="stat-card"><div className="stat-value">{summary?.internal_link_count ?? 0}</div><div className="stat-label">Internal Links</div></div>
                <div className="stat-card"><div className="stat-value">{summary?.external_link_count ?? 0}</div><div className="stat-label">External Links</div></div>
                <div className="stat-card"><div className="stat-value">{summary?.script_count ?? 0}</div><div className="stat-label">Scripts</div></div>
                <div className="stat-card"><div className="stat-value">{summary?.stylesheet_count ?? 0}</div><div className="stat-label">Stylesheets</div></div>
            </div>

            {/* Performance (v4) */}
            {perf && (
                <CollapsibleCard title="Performance Audit" icon="⚡" score={perf.score}>
                    <div className="stat-grid" style={{ marginBottom: 12 }}>
                        <div className="stat-card"><div className="stat-value">{perf.estimated_speed}</div><div className="stat-label">Load Speed</div></div>
                        <div className="stat-card"><div className="stat-value">{perf.html_size_kb} KB</div><div className="stat-label">Page Size</div></div>
                    </div>
                </CollapsibleCard>
            )}

            {/* Readability (v4) */}
            {read && (
                <CollapsibleCard title="Content Readability" icon="📖" score={read.score}>
                    <div className="stat-grid" style={{ marginBottom: 12 }}>
                        <div className="stat-card"><div className="stat-value">{read.grade_level}</div><div className="stat-label">Grade Level</div></div>
                        <div className="stat-card"><div className="stat-value">{read.reading_ease}</div><div className="stat-label">Ease Score</div></div>
                    </div>
                </CollapsibleCard>
            )}

            {/* Title & Meta */}
            <CollapsibleCard title="Page Title" icon="🏷️" defaultOpen={true}>
                <div style={{ background: 'var(--gp-glass)', padding: 16, borderRadius: 8, border: '1px solid var(--gp-glass-border)' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4A90FF' }}>{scraped.title || '(No title found)'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gp-text-muted)', marginTop: 4 }}>{(scraped.title || '').length} characters</p>
                </div>
            </CollapsibleCard>

            <CollapsibleCard title="Meta Description" icon="📋" defaultOpen={true}>
                <div style={{ background: 'var(--gp-glass)', padding: 16, borderRadius: 8, border: '1px solid var(--gp-glass-border)' }}>
                    <p style={{ fontSize: '0.92rem', color: 'var(--gp-text-secondary)', lineHeight: 1.6 }}>{scraped.meta_description || '(No meta description found)'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gp-text-muted)', marginTop: 4 }}>{(scraped.meta_description || '').length} characters</p>
                </div>
            </CollapsibleCard>

            {scraped.meta_keywords && (
                <CollapsibleCard title="Meta Keywords" icon="🔑">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {scraped.meta_keywords.split(',').map((kw, i) => (
                            <span className="tag tag-primary" key={i} style={{ padding: '6px 12px', fontSize: '0.82rem' }}>{kw.trim()}</span>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            {/* Lead Extractor (v4) */}
            {(scraped.emails?.length > 0 || scraped.phones?.length > 0) && (
                <CollapsibleCard title="Lead Extractor" icon="🎯" defaultOpen={true}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {scraped.emails?.length > 0 && (
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 6 }}>EMAILS FOUND:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {scraped.emails.map((email, i) => <span key={i} className="tag tag-accent">{email}</span>)}
                                </div>
                            </div>
                        )}
                        {scraped.phones?.length > 0 && (
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 6 }}>PHONE NUMBERS:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {scraped.phones.map((phone, i) => <span key={i} className="tag tag-primary">{phone}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleCard>
            )}

            {/* Open Graph */}
            {Object.keys(og).length > 0 && (
                <CollapsibleCard title="Open Graph Tags" icon="🌐">
                    <div style={{ display: 'grid', gap: 8 }}>
                        {Object.entries(og).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gp-glass-border)' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--gp-primary-light)', minWidth: 140 }}>{key}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--gp-text-secondary)', wordBreak: 'break-all' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            {/* Body Text Preview */}
            <CollapsibleCard title="Page Content Preview" icon="📄">
                <div style={{ background: 'var(--gp-glass)', padding: 16, borderRadius: 8, border: '1px solid var(--gp-glass-border)', maxHeight: 300, overflow: 'auto' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gp-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {scraped.body_text_preview || '(No text content found)'}
                    </p>
                </div>
            </CollapsibleCard>

            {/* JSON-LD */}
            <CollapsibleCard title={`Structured Data (JSON-LD) ${scraped.has_json_ld ? '✅' : '❌'}`} icon="📊">
                {scraped.has_json_ld ? (
                    <div style={{ maxHeight: 300, overflow: 'auto' }}>
                        {(scraped.json_ld_snippets || []).map((snippet, i) => (
                            <pre key={i} style={{ background: 'var(--gp-glass)', padding: 12, borderRadius: 8, fontSize: '0.78rem', color: 'var(--gp-accent)', overflow: 'auto', marginBottom: 8 }}>
                                {(() => { try { return JSON.stringify(JSON.parse(snippet), null, 2); } catch { return snippet; } })()}
                            </pre>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--gp-danger)', fontSize: '0.9rem' }}>No structured data found. Adding JSON-LD schema markup improves rich search results.</p>
                )}
            </CollapsibleCard>
        </div>
    );
}

// ── SEO Tab ─────────────────────────────────────────────────────────────
function SeoTab({ seo, scraped }) {
    const score = seo?.overall_score ?? 0;
    const priorities = seo?.top_priorities ?? [];
    const sectionScores = seo?.section_scores || {};

    // v4 Features
    const perf = seo?.performance_audit;
    const read = seo?.readability_analysis;
    const cit = seo?.citation_check;

    return (
        <div className="report-section">
            {/* Main Score */}
            <div className="card">
                <div className="score-gauge">
                    <ScoreRing score={score} />
                    <p style={{ marginTop: 16, color: 'var(--gp-text-secondary)', textAlign: 'center', maxWidth: 520, fontSize: '0.95rem' }}>
                        {seo?.summary ?? 'Analyzing…'}
                    </p>
                </div>

                {/* Section Score Bar */}
                {Object.keys(sectionScores).length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginTop: 24 }}>
                        {Object.entries(sectionScores).map(([key, val]) => {
                            const color = val >= 80 ? 'var(--gp-accent)' : val >= 60 ? 'var(--gp-info)' : val >= 40 ? 'var(--gp-warning)' : 'var(--gp-danger)';
                            return (
                                <div key={key} style={{ textAlign: 'center' }}>
                                    <div style={{ height: 6, borderRadius: 3, background: 'var(--gp-glass-border)', marginBottom: 6, overflow: 'hidden' }}>
                                        <div style={{ width: `${val}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 1s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--gp-text-muted)', textTransform: 'uppercase' }}>{key}</span>
                                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color }}>{val}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Title Analysis */}
            <CollapsibleCard title="Title Tag Analysis" icon="🏷️" score={seo?.title_analysis?.score} defaultOpen={true}>
                <div style={{ background: 'var(--gp-glass)', padding: 14, borderRadius: 8, marginBottom: 12, border: '1px solid var(--gp-glass-border)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gp-text-muted)', marginBottom: 4 }}>Current Title:</p>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#4A90FF' }}>{seo?.title_analysis?.current_title || '(empty)'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gp-text-muted)', marginTop: 4 }}>{seo?.title_analysis?.length} chars · Ideal: {seo?.title_analysis?.ideal_range}</p>
                </div>
                {(seo?.title_analysis?.issues || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {seo.title_analysis.issues.map((issue, i) => (
                            <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                        ))}
                    </div>
                )}
                <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {seo?.title_analysis?.recommendation}</p>
            </CollapsibleCard>

            {/* Meta Description */}
            <CollapsibleCard title="Meta Description" icon="📋" score={seo?.meta_description_analysis?.score}>
                <div style={{ background: 'var(--gp-glass)', padding: 14, borderRadius: 8, marginBottom: 12, border: '1px solid var(--gp-glass-border)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gp-text-muted)', marginBottom: 4 }}>Current:</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gp-text-secondary)', lineHeight: 1.6 }}>{seo?.meta_description_analysis?.current || '(empty)'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gp-text-muted)', marginTop: 4 }}>{seo?.meta_description_analysis?.length} chars · Ideal: {seo?.meta_description_analysis?.ideal_range}</p>
                </div>
                {(seo?.meta_description_analysis?.issues || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {seo.meta_description_analysis.issues.map((issue, i) => (
                            <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                        ))}
                    </div>
                )}
                <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {seo?.meta_description_analysis?.recommendation}</p>
            </CollapsibleCard>

            {/* Heading Structure */}
            <CollapsibleCard title="Heading Structure" icon="📑" score={seo?.heading_structure?.score} defaultOpen={true}>
                <div className="stat-grid" style={{ marginBottom: 16 }}>
                    <div className="stat-card"><div className="stat-value">{seo?.heading_structure?.h1_count ?? 0}</div><div className="stat-label">H1 Tags</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.heading_structure?.h2_count ?? 0}</div><div className="stat-label">H2 Tags</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.heading_structure?.h3_count ?? 0}</div><div className="stat-label">H3 Tags</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.heading_structure?.total_headings ?? 0}</div><div className="stat-label">Total</div></div>
                </div>

                {/* List all headings */}
                {(seo?.heading_structure?.h1_texts || []).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-accent)', marginBottom: 6 }}>H1 Tags:</p>
                        {seo.heading_structure.h1_texts.map((h, i) => (
                            <div key={i} style={{ background: 'var(--gp-glass)', padding: '10px 14px', borderRadius: 6, marginBottom: 4, border: '1px solid rgba(0,212,170,0.15)', fontSize: '0.9rem' }}>{h}</div>
                        ))}
                    </div>
                )}
                {(seo?.heading_structure?.h2_texts || []).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-info)', marginBottom: 6 }}>H2 Tags:</p>
                        {seo.heading_structure.h2_texts.map((h, i) => (
                            <div key={i} style={{ background: 'var(--gp-glass)', padding: '10px 14px', borderRadius: 6, marginBottom: 4, border: '1px solid rgba(84,160,255,0.12)', fontSize: '0.88rem', color: 'var(--gp-text-secondary)' }}>{h}</div>
                        ))}
                    </div>
                )}
                {(seo?.heading_structure?.h3_texts || []).length > 0 && (
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 6 }}>H3 Tags:</p>
                        {seo.heading_structure.h3_texts.map((h, i) => (
                            <div key={i} style={{ background: 'var(--gp-glass)', padding: '8px 14px', borderRadius: 6, marginBottom: 4, fontSize: '0.85rem', color: 'var(--gp-text-muted)' }}>{h}</div>
                        ))}
                    </div>
                )}

                {(seo?.heading_structure?.issues || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {seo.heading_structure.issues.map((issue, i) => (
                            <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                        ))}
                    </div>
                )}
            </CollapsibleCard>

            {/* Content Quality */}
            <CollapsibleCard title="Content Quality" icon="📝" score={seo?.content_quality?.score}>
                <div className="stat-grid" style={{ marginBottom: 12 }}>
                    <div className="stat-card"><div className="stat-value">{seo?.content_quality?.word_count ?? 0}</div><div className="stat-label">Total Words</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: '1rem' }}>{seo?.content_quality?.assessment ?? '—'}</div><div className="stat-label">Assessment</div></div>
                </div>

                {(seo?.content_quality?.issues || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {seo.content_quality.issues.map((issue, i) => (
                            <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                        ))}
                    </div>
                )}

                <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {seo?.content_quality?.recommendation}</p>
            </CollapsibleCard>

            {/* Image Optimization */}
            <CollapsibleCard title="Image Optimization" icon="🖼️" score={seo?.image_optimization?.score}>
                <div className="stat-grid" style={{ marginBottom: 12 }}>
                    <div className="stat-card"><div className="stat-value">{seo?.image_optimization?.total_images ?? 0}</div><div className="stat-label">Total Images</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ color: 'var(--gp-accent)' }}>{seo?.image_optimization?.with_alt ?? 0}</div><div className="stat-label">With Alt Text</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ color: 'var(--gp-danger)' }}>{seo?.image_optimization?.missing_alt ?? 0}</div><div className="stat-label">Missing Alt</div></div>
                </div>

                {(seo?.image_optimization?.issues || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {seo.image_optimization.issues.map((issue, i) => (
                            <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                        ))}
                    </div>
                )}

                <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {seo?.image_optimization?.recommendation}</p>

                {/* Individual Image Review */}
                {
                    (scraped?.images || []).length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 8 }}>IMAGE DETAILS:</p>
                            <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                {scraped.images.map((img, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                        background: 'var(--gp-glass)', borderRadius: 6, marginBottom: 4,
                                        border: `1px solid ${img.has_alt ? 'var(--gp-glass-border)' : 'rgba(255,107,107,0.2)'}`,
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>{img.has_alt ? '✅' : '❌'}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--gp-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.src}</p>
                                            <p style={{ fontSize: '0.82rem', color: img.has_alt ? 'var(--gp-accent)' : 'var(--gp-danger)' }}>
                                                {img.has_alt ? `Alt: "${img.alt}"` : 'Missing alt text'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </CollapsibleCard >

            {/* Link Profile */}
            < CollapsibleCard title="Link Profile" icon="🔗" score={seo?.link_profile?.score} >
                <div className="stat-grid" style={{ marginBottom: 12 }}>
                    <div className="stat-card"><div className="stat-value">{seo?.link_profile?.internal_count ?? 0}</div><div className="stat-label">Internal Links</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.link_profile?.external_count ?? 0}</div><div className="stat-label">External Links</div></div>
                </div>
                <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>💡 {seo?.link_profile?.recommendation}</p>

                {/* Link Lists */}
                {
                    (scraped?.internal_links || []).length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 6 }}>INTERNAL LINKS:</p>
                            <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--gp-glass)', borderRadius: 8, padding: 8 }}>
                                {scraped.internal_links.map((link, i) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.8rem', padding: '4px 8px', color: 'var(--gp-info)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</a>
                                ))}
                            </div>
                        </div>
                    )
                }
                {
                    (scraped?.external_links || []).length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gp-text-muted)', marginBottom: 6 }}>EXTERNAL LINKS:</p>
                            <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--gp-glass)', borderRadius: 8, padding: 8 }}>
                                {scraped.external_links.map((link, i) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.8rem', padding: '4px 8px', color: 'var(--gp-primary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</a>
                                ))}
                            </div>
                        </div>
                    )
                }
            </CollapsibleCard >

            {/* Readability (v4) */}
            {read && (
                <CollapsibleCard title="Readability" icon="📖" score={read.score} defaultOpen={read.score < 60}>
                    <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: read.score >= 60 ? 'var(--gp-accent)' : 'var(--gp-warning)', fontSize: '1.2rem' }}>{read.grade_level || 'N/A'}</div>
                            <div className="stat-label">Grade Level</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{read.reading_ease}</div>
                            <div className="stat-label">Reading Ease</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ fontSize: '1rem' }}>{read.assessment}</div>
                            <div className="stat-label">Assessment</div>
                        </div>
                    </div>

                    {(read.issues || []).length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            {read.issues.map((issue, i) => (
                                <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                            ))}
                        </div>
                    )}

                    <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {read.recommendation}</p>
                </CollapsibleCard>
            )}

            {/* Performance & Tech Audit (v4) */}
            {perf && (
                <CollapsibleCard title="Performance & Tech Audit" icon="⚡" score={perf.score} defaultOpen={perf.score < 80}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <div className="speed-gauge-container">
                            <div className="speed-gauge">
                                <div className="speed-gauge-base"></div>
                                <div className="speed-gauge-value" style={{ '--gauge-value': perf.score }}></div>
                            </div>
                            <div className="speed-label" style={{ color: perf.score >= 80 ? 'var(--gp-accent)' : perf.score >= 60 ? 'var(--gp-warning)' : 'var(--gp-danger)' }}>
                                {perf.score} / 100
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--gp-text-muted)', fontWeight: 600 }}>{perf.estimated_speed}</div>
                        </div>
                    </div>

                    <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card">
                            <div className="stat-value">{perf.html_size_kb}</div>
                            <div className="stat-label">Payload (KB)</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: perf.mobile_ready ? 'var(--gp-accent)' : 'var(--gp-danger)' }}>{perf.mobile_ready ? 'Yes' : 'No'}</div>
                            <div className="stat-label">Mobile Ready</div>
                        </div>
                    </div>
                    {(perf.issues || []).length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            {perf.issues.map((issue, i) => (
                                <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                            ))}
                        </div>
                    )}
                    <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {perf.recommendation}</p>
                </CollapsibleCard>
            )}

            {/* Citations & Directories (v4) */}
            {cit && (
                <CollapsibleCard title="Citations & Directories" icon="🔗" score={cit.score} defaultOpen={cit.score < 60}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                        <div style={{ flex: 1, minWidth: 200, background: 'var(--gp-glass)', padding: 16, borderRadius: 8, border: '1px solid rgba(0, 212, 170, 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-accent)', marginBottom: 8 }}>✅ Found On</p>
                            {cit.platforms_found.length > 0
                                ? cit.platforms_found.map((p, i) => <div key={i} style={{ fontSize: '0.9rem', marginBottom: 4 }}>{p}</div>)
                                : <div style={{ fontSize: '0.85rem', color: 'var(--gp-text-muted)' }}>No major platforms found.</div>
                            }
                        </div>
                        <div style={{ flex: 1, minWidth: 200, background: 'var(--gp-glass)', padding: 16, borderRadius: 8, border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gp-danger)', marginBottom: 8 }}>❌ Missing From</p>
                            {cit.platforms_missing.map((p, i) => <div key={i} style={{ fontSize: '0.9rem', marginBottom: 4, color: 'var(--gp-text-secondary)' }}>{p}</div>)}
                        </div>
                    </div>
                    {(cit.issues || []).length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            {cit.issues.map((issue, i) => (
                                <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                            ))}
                        </div>
                    )}
                    <p style={{ color: 'var(--gp-text-secondary)', fontSize: '0.9rem', marginTop: 12 }}>💡 {cit.recommendation}</p>
                </CollapsibleCard>
            )}

            {/* Technical SEO */}
            < CollapsibleCard title="Technical SEO" icon="⚙️" score={seo?.technical_seo?.score} >
                <div className="stat-grid" style={{ marginBottom: 12 }}>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: '1rem' }}>{seo?.technical_seo?.has_json_ld ? '✅' : '❌'}</div><div className="stat-label">JSON-LD</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: '1rem' }}>{seo?.technical_seo?.has_og_tags ? '✅' : '❌'}</div><div className="stat-label">OG Tags</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.technical_seo?.script_count ?? 0}</div><div className="stat-label">Scripts</div></div>
                    <div className="stat-card"><div className="stat-value">{seo?.technical_seo?.stylesheet_count ?? 0}</div><div className="stat-label">Stylesheets</div></div>
                </div>
                {
                    (seo?.technical_seo?.issues || []).map((issue, i) => (
                        <p key={i} style={{ color: 'var(--gp-warning)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ {issue}</p>
                    ))
                }
            </CollapsibleCard >

            {/* Keyword Density */}
            {
                seo?.keyword_density && seo.keyword_density.length > 0 && (
                    <CollapsibleCard title="Keyword Density Analysis" icon="📊" defaultOpen={true}>
                        <div style={{ background: 'var(--gp-glass)', padding: 14, borderRadius: 8, border: '1px solid var(--gp-glass-border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                                {seo.keyword_density.map((k, i) => (
                                    <div key={i} style={{
                                        padding: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 6,
                                        border: '1px solid var(--gp-glass-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4
                                    }}>
                                        <div style={{ fontWeight: 700, color: 'var(--gp-primary-light)', fontSize: '0.9rem' }}>{k.keyword}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gp-text-muted)' }}>{k.density}% density</span>
                                            <span className={`tag ${k.status === 'High' ? 'tag-warning' : k.status === 'Ideal' ? 'tag-accent' : 'tag-primary'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                                {k.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p style={{ color: 'var(--gp-text-muted)', fontSize: '0.8rem', marginTop: 10 }}>
                            💡 <strong>Real Info:</strong> Density measures how often a word appears relative to the total word count. Ideal range is 1-3%.
                        </p>
                    </CollapsibleCard>
                )
            }

            {/* Top Priorities */}
            {
                priorities.length > 0 && (
                    <div className="card">
                        <h3 className="section-heading">🚀 Top Priorities — Fix These First</h3>
                        <ul className="priority-list">
                            {priorities.map((p, i) => (
                                <li className="priority-item" key={i}>
                                    <span className="priority-badge">{i + 1}</span>
                                    <span className="priority-text">{typeof p === 'string' ? p : p.action || JSON.stringify(p)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        </div >
    );
}

// ── Content Strategy Tab ────────────────────────────────────────────────
function ContentTab({ data }) {
    if (!data) return null;
    return (
        <div className="report-section">
            <div className="card">
                <h3 className="section-heading">🏪 Business Insights</h3>
                <div className="stat-grid">
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: '0.95rem' }}>{data.business_type ?? '—'}</div><div className="stat-label">Business Type</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: '0.8rem' }}>{data.target_audience ?? '—'}</div><div className="stat-label">Target Audience</div></div>
                </div>
            </div>

            {/* Detected Keywords */}
            {data.detected_keywords && data.detected_keywords.length > 0 && (
                <CollapsibleCard title="Detected Keywords" icon="🔍" defaultOpen={true}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {data.detected_keywords.map((k, i) => (
                            <span className="tag tag-primary" key={i} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>{k.keyword} <span style={{ opacity: 0.5 }}>×{k.frequency}</span></span>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            {data.content_pillars && (
                <CollapsibleCard title="Content Pillars" icon="🏛️" defaultOpen={true}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.content_pillars.map((p, i) => (
                            <span className="tag tag-accent" key={i} style={{ fontSize: '0.85rem', padding: '10px 18px' }}>{p}</span>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            {data.blog_ideas && (
                <div className="card">
                    <h3 className="section-heading">📝 Blog Post Ideas</h3>
                    <div className="content-grid">
                        {data.blog_ideas.map((b, i) => (
                            <div className="content-card" key={i}>
                                <div className="content-card-title">{b.title ?? b}</div>
                                {b.description && <div className="content-card-desc">{b.description}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.local_seo_tips && (
                <div className="card">
                    <h3 className="section-heading">📍 Local SEO Tips</h3>
                    <ul className="priority-list">
                        {data.local_seo_tips.map((tip, i) => (
                            <li className="priority-item" key={i}>
                                <span className="priority-badge" style={{ background: 'var(--gp-accent)' }}>{i + 1}</span>
                                <span className="priority-text">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Social Media Tab ────────────────────────────────────────────────────
function SocialTab({ data }) {
    if (!data) return null;
    return (
        <div className="report-section">
            {data.platform_recommendations && (
                <div className="card">
                    <h3 className="section-heading">📱 Recommended Platforms</h3>
                    <div className="content-grid">
                        {data.platform_recommendations.map((p, i) => (
                            <div className="content-card" key={i}>
                                <div className="content-card-title">{p.platform ?? p.name ?? p}</div>
                                {p.reason && <div className="content-card-desc">{p.reason}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.posts && (
                <div className="card">
                    <h3 className="section-heading">✍️ Ready-to-Post Content</h3>
                    <div className="content-grid">
                        {data.posts.map((post, i) => (
                            <div className="content-card" key={i}>
                                <div className="content-card-meta" style={{ marginTop: 0, marginBottom: 10 }}>
                                    <span className="tag tag-primary">{post.platform}</span>
                                    {post.post_type && <span className="tag tag-accent">{post.post_type}</span>}
                                </div>
                                <div className="content-card-desc" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
                                {post.hashtags && post.hashtags.length > 0 && (
                                    <div className="content-card-meta">
                                        {post.hashtags.map((h, j) => (
                                            <span className="tag tag-warning" key={j}>{h}</span>
                                        ))}
                                    </div>
                                )}
                                {post.best_time_to_post && (
                                    <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--gp-text-muted)' }}>🕐 Best time: {post.best_time_to_post}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Competitors Tab ─────────────────────────────────────────────────────
function CompetitorsTab({ data }) {
    if (!data) return (
        <div className="report-section">
            <div className="card" style={{ textAlign: 'center', color: 'var(--gp-text-muted)', padding: 48 }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>🏢</p>
                <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Competitor analysis requires Business Type & Location</p>
                <p style={{ fontSize: '0.85rem' }}>Fill in those optional fields and re-analyze to get competitor data.</p>
            </div>
        </div>
    );

    const nearby = data.nearby_competitors ?? [];
    return (
        <div className="report-section">
            <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(108,99,255,0.05) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>🌍</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Truly Free Search via OpenStreetMap</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gp-text-muted)' }}>Showing real businesses near {data.search_query || 'your location'}</p>
                    </div>
                </div>
            </div>

            {nearby.length > 0 ? (
                <div className="card">
                    <h3 className="section-heading">🏢 Nearby Competitors</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="competitor-table">
                            <thead><tr><th>Name</th><th>Address</th><th>Rating</th><th>Status</th></tr></thead>
                            <tbody>
                                {nearby.map((c, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--gp-text-secondary)' }}>{c.address}</td>
                                        <td><span className="rating-stars">★ {c.rating}</span> <span style={{ fontSize: '0.7rem', color: 'var(--gp-text-muted)' }}>({c.total_ratings})</span></td>
                                        <td><span className="tag tag-accent">{c.business_status ?? 'OPERATIONAL'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p>No competitors found in this specific area via OSM. Try a broader location or different business type.</p>
                </div>
            )}
        </div>
    );
}

// ── Main App ────────────────────────────────────────────────────────────
export default function App() {
    const [url, setUrl] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const cities = selectedState ? STATE_CITIES[selectedState] : [];

    // Reset city when state changes
    useEffect(() => {
        setSelectedCity('');
    }, [selectedState]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        setLoading(true);
        setError('');
        setResults(null);

        const location = selectedCity && selectedState ? `${selectedCity}, ${selectedState}, India` : '';

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url.trim(),
                    business_type: businessType.trim(),
                    location: location,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Request failed (${res.status})`);
            }

            const data = await res.json();
            setResults(data);
            setActiveTab('overview');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'seo', label: '🎯 SEO Audit' },
        { key: 'content', label: '📝 Content Strategy' },
        { key: 'social', label: '📱 Social Media' },
        { key: 'competitors', label: '🏢 Competitors' },
    ];

    const handleExportPdf = () => {
        const element = document.querySelector('.results-container');
        if (!element) return;

        // Temporarily hide the tabs during export to make it look like a clean report
        const tabs = element.querySelector('.tabs');
        if (tabs) tabs.style.display = 'none';

        // Apply a global class so CSS handles exactly what the PDF looks like on the live DOM
        element.classList.add('pdf-exporting');

        const opt = {
            margin: 10,
            filename: `GrowthPilot_Report_${new URL(results.url).hostname}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#0B0E17' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Needs dynamic import since html2pdf is not an ES module by default in Vite sometimes
        import('html2pdf.js').then(html2pdf => {
            // Give the browser a moment to apply the .pdf-exporting classes fully
            setTimeout(() => {
                html2pdf.default().set(opt).from(element).save().then(() => {
                    // Restore tabs and remove export class
                    element.classList.remove('pdf-exporting');
                    if (tabs) tabs.style.display = 'flex';
                });
            }, 500);
        });
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="logo-icon">🚀</div>
                    GrowthPilot
                </div>
                <div className="navbar-links">
                    {results && (
                        <>
                            <button onClick={handleExportPdf} style={{ background: 'var(--gp-primary)', color: 'white', marginRight: 8 }}>📄 Export PDF</button>
                            <button onClick={() => setResults(null)}>+ New Analysis</button>
                        </>
                    )}
                </div>
            </nav>

            <div className="app-container">
                {!results && !loading && (
                    <>
                        <section className="hero">
                            <div className="hero-badge">✨ AI-Powered Business Intelligence</div>
                            <h1>Grow Your Local<br />Business Faster</h1>
                            <p>Enter your website URL and get a complete growth report — SEO audit, content strategy, social media posts, and competitive analysis. All in seconds.</p>
                        </section>

                        <form className="analysis-card" onSubmit={handleAnalyze}>
                            <div className="form-group">
                                <label htmlFor="url-input">Website URL</label>
                                <input id="url-input" type="url" placeholder="https://your-business.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="type-input">Business Type (optional)</label>
                                    <input id="type-input" type="text" placeholder="e.g. Restaurant, Plumber" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="state-input">State</label>
                                    <select id="state-input" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                                        <option value="">Select State</option>
                                        {INDIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="city-input">City</label>
                                    <select id="city-input" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
                                        <option value="">Select City</option>
                                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button className="btn-primary" type="submit">🔍 Analyze My Business</button>
                        </form>
                    </>
                )}

                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner" />
                        <div className="loading-text">Scanning & analyzing your website…</div>
                        <div className="loading-subtext">Checking SEO, content, headings, images, links, and more</div>
                    </div>
                )}

                {error && (
                    <div className="error-box" style={{ maxWidth: 600, margin: '40px auto' }}>
                        <p style={{ fontWeight: 700, marginBottom: 8 }}>Analysis Failed</p>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ maxWidth: 200, margin: '20px auto 0' }} onClick={() => { setError(''); setResults(null); }}>Try Again</button>
                    </div>
                )}

                {results && (
                    <div className="results-container">
                        <div className="results-header">
                            <h2>Growth Report</h2>
                            <p>Analysis of <strong>{results.url}</strong></p>
                        </div>

                        <div className="tabs">
                            {tabs.map(t => (
                                <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
                            ))}
                        </div>

                        {activeTab === 'overview' && <OverviewTab scraped={results.scraped_data} summary={results.scraped_summary} seo={results.seo_report} />}
                        {activeTab === 'seo' && <SeoTab seo={results.seo_report} scraped={results.scraped_data} />}
                        {activeTab === 'content' && <ContentTab data={results.content_strategy} />}
                        {activeTab === 'social' && <SocialTab data={results.social_media_posts} />}
                        {activeTab === 'competitors' && <CompetitorsTab data={results.competitor_analysis} />}
                    </div>
                )}
            </div>

            <footer className="footer">GrowthPilot © 2026 — AI-Based Local Business Growth Engine</footer>
        </>
    );
}
