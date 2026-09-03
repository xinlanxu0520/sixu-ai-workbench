'use client';
/* eslint-disable jsx-a11y/label-has-associated-control, react/react-compiler */

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Check, ChevronDown, CircleAlert, CirclePlus, Clock3, Compass, ExternalLink, Feather, FileText, Filter, Home, Lightbulb, Link2, Menu, MessageCircleQuestion, MoreHorizontal, Plus, Search, Settings2, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type View = 'home' | 'library' | 'source' | 'ask' | 'topic' | 'thinking' | 'ideas' | 'create' | 'profile';
type Source = { id: number; title: string; platform: string; kind: string; status: string; date: string; summary: string; tags: string[]; original?: boolean };
type Idea = { id: number; statement: string; reason: string; boundary: string; evidence: number; status: string };

const NAV = [
  { id: 'home' as View, label: 'Home', icon: Home }, { id: 'library' as View, label: '知识库', icon: BookOpen },
  { id: 'ideas' as View, label: '观点', icon: Lightbulb }, { id: 'create' as View, label: '创作', icon: Feather },
  { id: 'profile' as View, label: '我的', icon: UserRound },
];

const TOPICS = [
  { type: '趋势机会', title: 'AI 工具正在从“替你完成”转向“陪你判断”', reason: '你最近收藏的 4 条内容都在讨论 AI 工作流，但你的旧文章更强调人的判断。', meta: '4 条个人素材 · 近 7 天讨论上升', tone: 'terracotta', icon: Sparkles },
  { type: '隐藏连接', title: '知识管理的终点，也许不是整理而是形成观点', reason: '“第二大脑”与“内容选题焦虑”两个主题，在你的资料中出现了新的交叉。', meta: '连接 2 个知识簇 · 6 条证据', tone: 'sage', icon: BrainCircuit },
  { type: '反常识', title: '收藏越多，反而可能越难开始创作', reason: '你的收藏中存在两种冲突：持续输入能带来灵感，也可能推迟表达。', meta: '2 组相反观点 · 5 条证据', tone: 'blue', icon: Compass },
  { type: '你的观点', title: '真正有价值的 AI，不应该替创作者拥有观点', reason: '这是你三个月前写下的判断；现在有 3 条新证据可以继续展开。', meta: '形成于 6 月 18 日 · 3 条新证据', tone: 'gold', icon: Lightbulb },
  { type: '受众需要', title: '如何把零散收藏变成一周选题计划？', reason: '你的目标读者最近更关心可执行的方法，而这个问题还未被你系统回答。', meta: '匹配“知识型创作者” · 内容缺口', tone: 'ink', icon: UserRound },
];

const INITIAL_SOURCES: Source[] = [
  { id: 1, title: 'AI 时代，稀缺的不是答案而是判断', platform: '公众号', kind: '历史原创', status: '深度理解完成', date: '今天 09:42', summary: '讨论生成式 AI 如何改变知识工作的价值重心，以及个人判断力的重要性。', tags: ['AI', '判断力', '知识工作'], original: true },
  { id: 2, title: '为什么我们收藏了很多，却依然不知道写什么', platform: '小红书', kind: '收藏', status: '深度理解完成', date: '昨天', summary: '从信息囤积和行动回避两个角度解释收藏与输出之间的断层。', tags: ['收藏', '创作焦虑'] },
  { id: 3, title: 'Building a Second Brain, Revisited', platform: 'YouTube', kind: '视频', status: 'AI 解析中', date: '2 天前', summary: '重新审视第二大脑方法，以及 AI 参与知识整理后的新工作流。', tags: ['PKM', '工作流'] },
  { id: 4, title: '内容创作者如何建立自己的观点系统', platform: 'B站', kind: '视频', status: '部分内容未解析', date: '4 天前', summary: '从输入、辨析、表达和反馈四个阶段建立可复用的观点资产。', tags: ['观点', '创作者'] },
  { id: 5, title: '工具越智能，人越需要保留什么？', platform: '小红书', kind: '收藏', status: '深度理解完成', date: '8 月 28 日', summary: '区分执行委托与判断委托，主张人需要拥有问题定义权。', tags: ['AI', '主体性'] },
  { id: 6, title: '我的内容系统：从素材到发布', platform: '公众号', kind: '历史原创', status: '深度理解完成', date: '8 月 22 日', summary: '个人内容工作流的旧版梳理，强调固定流程与低摩擦记录。', tags: ['方法论', '创作系统'], original: true },
];

const INITIAL_IDEAS: Idea[] = [
  { id: 1, statement: '真正有价值的 AI，不应该替创作者拥有观点，而应该提高形成观点的质量。', reason: '创作者的长期价值来自判断的一致性与演化，而不是单次文本的完成速度。', boundary: '适用于知识型内容创作；标准化商业文案仍可更多委托给 AI。', evidence: 6, status: '活跃' },
  { id: 2, statement: '收藏不是知识积累，只有被重新用于判断的素材才会产生复利。', reason: '储存只降低遗忘，却没有自动缩短从理解到表达的距离。', boundary: '对于纯检索型资料，收藏本身仍有价值。', evidence: 4, status: '草稿' },
];

export default function SixuWorkspace() {
  const [view, setView] = useState<View>('home');
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [selectedSource, setSelectedSource] = useState(1);
  const [savedTopics, setSavedTopics] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('sixu-state');
    if (cached) { try { const data = JSON.parse(cached); if (data.sources) setSources(data.sources); if (data.ideas) setIdeas(data.ideas); if (data.savedTopics) setSavedTopics(data.savedTopics); } catch {} }
  }, []);
  useEffect(() => { localStorage.setItem('sixu-state', JSON.stringify({ sources, ideas, savedTopics })); }, [sources, ideas, savedTopics]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3600); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    const context = typeof document === 'undefined' ? undefined : (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: 'add_source', title: '添加素材', description: '把一份素材添加到思序知识库并进入解析状态。', inputSchema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, platform: { type: 'string' } }, required: ['title', 'content'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: (input: unknown) => { const value = input as { title?: string; content?: string; platform?: string }; if (!value.title?.trim() || !value.content?.trim()) throw new Error('title 与 content 不能为空'); const item: Source = { id: Date.now(), title: value.title.trim(), platform: value.platform || '手动输入', kind: '收藏', status: 'AI 解析中', date: '刚刚', summary: value.content.slice(0, 72), tags: ['待整理'] }; setSources((current) => [item, ...current]); setView('library'); return { id: item.id, status: 'processing' }; } }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, []);

  const navigate = (next: View) => { setView(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const addSource = (source: Source) => { setSources((current) => [source, ...current]); setNotice('素材已收录，正在深度理解'); };
  const selected = sources.find((item) => item.id === selectedSource) || sources[0];
  return <div className="app-shell">
    <Sidebar view={view} navigate={navigate} open={mobileOpen} />
    <main className="main-stage">
      <Topbar navigate={navigate} addSource={addSource} openMenu={() => setMobileOpen(!mobileOpen)} />
      {view === 'home' && <HomeView navigate={navigate} saved={savedTopics} setSaved={setSavedTopics} />}
      {view === 'library' && <LibraryView sources={sources} openSource={(id) => { setSelectedSource(id); navigate('source'); }} />}
      {view === 'source' && selected && <SourceView source={selected} back={() => navigate('library')} />}
      {view === 'ask' && <AskView navigate={navigate} />}
      {view === 'topic' && <TopicView navigate={navigate} />}
      {view === 'thinking' && <ThinkingView navigate={navigate} confirmIdea={(idea) => { setIdeas((current) => [idea, ...current]); setNotice('观点已确认并收入观点库'); navigate('ideas'); }} />}
      {view === 'ideas' && <IdeasView ideas={ideas} navigate={navigate} />}
      {view === 'create' && <CreateView ideas={ideas} setNotice={setNotice} />}
      {view === 'profile' && <ProfileView setNotice={setNotice} />}
    </main>
    <MobileNav view={view} navigate={navigate} />
    {notice && <output className="toast"><Check />{notice}</output>}
  </div>;
}

function Sidebar({ view, navigate, open }: { view: View; navigate: (v: View) => void; open: boolean }) {
  return <aside className={`sidebar ${open ? 'mobile-open' : ''}`} aria-label="主导航"><button className="brand" onClick={() => navigate('home')} aria-label="回到首页"><span className="brand-mark">思</span><span className="brand-name">思序</span></button><nav className="nav-list">{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`nav-item ${view === item.id ? 'active' : ''}`}><Icon /><span>{item.label}</span></button>; })}</nav><div className="sidebar-note"><span className="eyebrow">本周进展</span><strong>2 个观点正在形成</strong><div className="progress-track"><span style={{ width: '64%' }} /></div><small>继续一次未完成的思考</small></div><div className="profile-chip"><span className="avatar">林</span><span><strong>林默</strong><small>AI × 创作</small></span></div></aside>;
}

function Topbar({ navigate, addSource, openMenu }: { navigate: (v: View) => void; addSource: (s: Source) => void; openMenu: () => void }) {
  return <header className="topbar"><button className="menu-button" onClick={openMenu} aria-label="打开菜单"><Menu /></button><button className="ask-button" onClick={() => navigate('ask')}><Search /> 问问我的知识 <kbd>⌘ K</kbd></button><div className="top-actions"><AddSourceDialog addSource={addSource} /><button className="avatar-button" onClick={() => navigate('profile')} aria-label="打开个人资料">林</button></div></header>;
}

function PageHead({ kicker, title, description, action }: { kicker: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="page-head"><div><p className="eyebrow">{kicker}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>; }

function HomeView({ navigate, saved, setSaved }: { navigate: (v: View) => void; saved: string[]; setSaved: (v: string[]) => void }) {
  return <div className="page-wrap home-page"><section className="hero"><div><p className="eyebrow">THURSDAY · 03 SEPTEMBER</p><h1>你的知识，今天能<br />帮你创作什么？</h1><p className="hero-copy">过去 30 天，你留下了 28 份素材。它们正在汇成一些值得继续思考的方向。</p></div><div className="memory-stack" aria-label="近期素材正在形成关联"><MemoryCard className="memory-one" label="视频" title={<>AI 时代的<br />个人判断力</>} meta="12:48 · B站" /><MemoryCard className="memory-two" label="收藏" title={<>我们为什么<br />总在囤积信息</>} meta="小红书 · 4 天前" /><MemoryCard className="memory-three" label="原创" title={<>知识库不是<br />第二个文件夹</>} meta="公众号 · 6 月" /><div className="thread-line" /><span className="connection-dot">5</span></div></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">TODAY&apos;S OPPORTUNITIES</p><h2>今天值得继续的方向</h2></div><button className="text-action">刷新发现 <Sparkles /></button></div><div className="topic-grid">{TOPICS.map((topic, index) => { const Icon = topic.icon; const isSaved = saved.includes(topic.title); return <article className={`topic-card ${topic.tone} ${index === 0 ? 'featured' : ''}`} key={topic.title}><div className="topic-top"><span className="topic-type"><Icon />{topic.type}</span><button className="save-dot" onClick={() => setSaved(isSaved ? saved.filter((item) => item !== topic.title) : [...saved, topic.title])} aria-label={isSaved ? '取消保存' : '保存选题'}>{isSaved ? '已存' : '+'}</button></div><h3>{topic.title}</h3><p>{topic.reason}</p><div className="topic-footer"><small>{topic.meta}</small><button onClick={() => navigate('topic')}>查看依据 <ArrowRight /></button></div></article>; })}</div></section><section className="lower-grid"><article className="insight-panel"><div className="section-heading compact"><div><p className="eyebrow">AI INSIGHTS</p><h2>知识正在发生变化</h2></div><span className="count-pill">3</span></div><Insight icon="↗" title="你的“AI 效率”观点可能正在变化" text="最近新增的 3 条素材更关注判断质量，而不只是节省时间。" meta="因为你在 11 天内重复收藏了相近主题" /><Insight icon="⌁" title="两份旧资料有了新连接" text="“信息焦虑”与“内容定位”都指向同一个行动缺口。" meta="基于 5 条收藏与 1 篇原创" /></article><article className="continue-panel"><p className="eyebrow">CONTINUE THINKING</p><span className="session-label">上次停在 · 边界</span><h3>AI 应该在创作中扮演什么角色？</h3><p>“如果 AI 不替你判断，那么它最应该在哪一步介入？”</p><div className="idea-slots"><span className="done">判断</span><span className="done">原因</span><span>边界</span><span>证据</span><span>反方</span></div><Button onClick={() => navigate('thinking')} className="primary-cta">继续思考 <ArrowRight /></Button></article></section></div>;
}

function MemoryCard({ className, label, title, meta }: { className: string; label: string; title: React.ReactNode; meta: string }) { return <div className={`memory-card ${className}`}><span>{label}</span><strong>{title}</strong><small>{meta}</small></div>; }
function Insight({ icon, title, text, meta }: { icon: string; title: string; text: string; meta: string }) { return <div className="insight-row"><span className="insight-icon">{icon}</span><div><strong>{title}</strong><p>{text}</p><small>{meta}</small></div><button>看看</button></div>; }

function LibraryView({ sources, openSource }: { sources: Source[]; openSource: (id: number) => void }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('全部');
  const filtered = useMemo(() => sources.filter((source) => (filter === '全部' || source.kind === filter) && `${source.title}${source.summary}${source.tags.join('')}`.toLowerCase().includes(query.toLowerCase())), [sources, query, filter]);
  return <div className="work-page"><PageHead kicker="LIBRARY" title="个人知识库" description={`${sources.length} 份素材 · 86 个知识单元`} action={<Button variant="outline"><Settings2 /> 批量整理</Button>} /><div className="library-toolbar"><div className="search-field"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、内容或标签" /></div><div className="filter-row">{['全部', '历史原创', '收藏', '视频'].map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'active' : ''}>{item}</button>)}<button><Filter /> 更多筛选</button></div></div><div className="source-grid">{filtered.map((source) => <button className="source-card" key={source.id} onClick={() => openSource(source.id)}><div className={`source-cover cover-${source.id % 4}`}><span>{source.platform}</span><FileText /></div><div className="source-content"><div className="source-meta"><span>{source.kind}</span><span className={`status ${source.status.includes('完成') ? 'complete' : source.status.includes('解析中') ? 'processing' : 'partial'}`}>{source.status}</span></div><h3>{source.title}</h3><p>{source.summary}</p><div className="tag-row">{source.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><small>{source.date}</small></div></button>)}</div>{filtered.length === 0 && <div className="empty-state"><Search /><h3>没有找到相关素材</h3><p>换一个关键词，或清除当前筛选。</p></div>}</div>;
}
function SourceView({ source, back }: { source: Source; back: () => void }) {
  const [note, setNote] = useState('这篇内容让我意识到：判断力不是一种抽象能力，而是在证据、边界和反方之间持续校准。');
  return <div className="work-page source-detail"><button className="back-link" onClick={back}><ArrowLeft /> 返回知识库</button><PageHead kicker={`${source.platform} · ${source.kind}`} title={source.title} description={`${source.date} · ${source.status}`} action={<Button variant="outline"><MoreHorizontal /> 更多</Button>} /><div className="detail-layout"><article className="document-pane"><div className="coverage-banner"><Check /> 原始内容只读保存 · 引用可定位</div><h2>AI 时代，真正稀缺的是什么？</h2><p>当答案的生产成本不断下降，知识工作的价值正在从“知道答案”转向“判断什么值得问、什么可以相信，以及什么时候应该行动”。</p><p className="anchor-highlight">AI 可以缩短执行路径，但不能替一个人承担判断的后果。真正可持续的创作，不是把写作本身外包，而是让工具帮助我们看见证据之间的联系与矛盾。</p><p>因此，个人知识系统需要从被动存储转向主动生长：它不仅应该告诉我们保存了什么，也应该提示这些积累正在指向哪些新的问题。</p><footer>段落 2–4 · Source Anchor 可用</footer></article><aside className="evidence-pane"><Tabs defaultValue="units"><TabsList><TabsTrigger value="units">知识单元</TabsTrigger><TabsTrigger value="note">我的笔记</TabsTrigger><TabsTrigger value="related">关联</TabsTrigger></TabsList><TabsContent value="units"><KnowledgeUnit type="观点" text="AI 的核心价值不应只是提高生成速度，而是帮助人提高判断质量。" confidence="高置信" /><KnowledgeUnit type="论据" text="当答案供给过剩，问题定义、证据辨析和边界意识会更加稀缺。" confidence="高置信" /><KnowledgeUnit type="问题" text="哪些判断可以委托给 AI，哪些必须由创作者保留？" confidence="待确认" /></TabsContent><TabsContent value="note"><label className="note-field">我的理解<Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={9} /></label><small className="autosave">✓ 已自动保存</small></TabsContent><TabsContent value="related"><Related title="工具越智能，人越需要保留什么？" relation="支持" /><Related title="AI 写作的真正瓶颈不是生成" relation="相似" /><Related title="效率工具如何改变创作习惯" relation="补充案例" /></TabsContent></Tabs></aside></div></div>;
}

function KnowledgeUnit({ type, text, confidence }: { type: string; text: string; confidence: string }) { return <div className="knowledge-unit"><div><span>{type}</span><small>{confidence}</small></div><p>{text}</p><button>查看原文 <ExternalLink /></button></div>; }
function Related({ title, relation }: { title: string; relation: string }) { return <button className="related-item"><span>{relation}</span><strong>{title}</strong><ArrowRight /></button>; }

function AskView({ navigate }: { navigate: (v: View) => void }) {
  const [question, setQuestion] = useState('我的资料里，对 AI 与个人判断力有哪些不同看法？'); const [asked, setAsked] = useState(false); const [web, setWeb] = useState(false);
  return <div className="reading-page"><PageHead kicker="ASK" title="问问我的知识" description="默认只从你的个人知识中寻找答案。" /><form className="ask-composer" onSubmit={(event) => { event.preventDefault(); setAsked(true); }}><Textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} placeholder="问一个与你的知识有关的问题…" /><div><label><Switch checked={web} onCheckedChange={setWeb} /> 我的知识 + Web</label><Button type="submit" className="primary-cta">开始检索 <ArrowRight /></Button></div></form>{asked ? <article className="answer-card"><div className="coverage-state"><Check /> 知识充分 <small>找到 6 条直接证据</small></div><h2>你的资料里主要有两种看法，但它们并不完全冲突。</h2><p>第一种看法认为，AI 的价值首先是<strong>降低执行成本</strong>：它让搜集、整理和初稿生成更快，使创作者能把更多时间留给选择。</p><Citation source="我的原创" title="AI 时代，稀缺的不是答案而是判断" quote="AI 可以缩短执行路径，但不能替一个人承担判断的后果。" /><p>第二种看法更警惕“判断委托”。几份收藏都指出，当工具直接给出结构完整的答案时，人可能跳过形成判断所需的证据比较与反思过程。</p><Citation source="我的收藏" title="工具越智能，人越需要保留什么？" quote="效率提升并不自动等于认知质量提升。" /><div className="conflict-box"><CircleAlert /><div><strong>资料中存在一个值得保留的张力</strong><p>AI 一方面释放注意力，另一方面也可能让人更少练习判断。你过去的观点更倾向于：把执行交给 AI，但保留问题定义和最终判断。</p></div></div><div className="answer-actions"><Button variant="outline">保存为笔记</Button><Button onClick={() => navigate('topic')} className="primary-cta"><Lightbulb /> 生成 Topic Card</Button></div></article> : <div className="suggestions"><p>可以这样问</p>{['我最近对知识管理的看法发生了什么变化？', '有哪些收藏与我过去的观点相反？', '从我的素材里找 3 个还没写过的方向'].map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<ArrowRight /></button>)}</div>}</div>;
}
function Citation({ source, title, quote }: { source: string; title: string; quote: string }) { return <button className="citation"><span>{source}</span><div><strong>{title}</strong><p>“{quote}”</p></div><ExternalLink /></button>; }

function TopicView({ navigate }: { navigate: (v: View) => void }) {
  const [saved, setSaved] = useState(false);
  return <div className="work-page topic-workspace"><button className="back-link" onClick={() => navigate('home')}><ArrowLeft /> 返回今日机会</button><div className="topic-hero"><div><span className="topic-type"><Sparkles /> 趋势机会</span><h1>AI 工具正在从“替你完成”转向“陪你判断”</h1><p>基于你最近的个人知识与关注变化，这个主题既有足够素材，也出现了新的讨论窗口。</p><div className="topic-actions"><Button onClick={() => navigate('thinking')} className="primary-cta">开始观点孵化 <ArrowRight /></Button><Button variant="outline" onClick={() => setSaved(!saved)}>{saved ? <Check /> : <Plus />}{saved ? '已保存' : '先保存'}</Button></div></div><div className="why-card"><p className="eyebrow">WHY NOW</p><strong>为什么现在值得做</strong><ul><li>你在 11 天内新增了 4 份相关素材</li><li>其中 2 份与你 6 月的观点形成张力</li><li>目标读者正在寻找“人如何保留主体性”的方法</li></ul></div></div><div className="workspace-grid"><section><div className="section-heading compact"><div><p className="eyebrow">PERSONAL EVIDENCE</p><h2>你的素材里有什么</h2></div><span className="count-pill">6 条</span></div><Evidence relation="支持" type="观点" title="AI 应该成为思考的脚手架，而不是观点的代写者" source="我的原创 · AI 时代，稀缺的不是答案而是判断" /><Evidence relation="支持" type="论据" title="当生成成本趋近于零，选择与判断会成为新的稀缺能力" source="我的收藏 · 工具越智能，人越需要保留什么？" /><Evidence relation="补充" type="案例" title="一套先证据、再提问、最后成稿的 AI 内容工作流" source="B站 · 内容创作者如何建立自己的观点系统" /></section><aside><div className="section-heading compact"><div><p className="eyebrow">TENSION</p><h2>值得想清楚的冲突</h2></div></div><div className="tension-card"><div><span>A</span><strong>AI 释放执行时间，让人更能专注判断</strong><small>3 条证据</small></div><div><span>B</span><strong>过度依赖完整答案，会削弱判断过程</strong><small>2 条证据</small></div></div><div className="thinking-prompt"><MessageCircleQuestion /><p>如果“提高判断质量”才是目标，AI 应该在哪一步停下来，把决定交还给人？</p><button onClick={() => navigate('thinking')}>带着这个问题开始 <ArrowRight /></button></div></aside></div></div>;
}
function Evidence({ relation, type, title, source }: { relation: string; type: string; title: string; source: string }) { return <article className="evidence-card"><div><span className={`relation ${relation === '支持' ? 'support' : 'extra'}`}>{relation}</span><span>{type}</span></div><h3>{title}</h3><p>{source}</p><button>查看原文定位 <ExternalLink /></button></article>; }

const QUESTIONS = [
  '你说 AI 应该帮助判断。这里的“帮助”与“替代”，最关键的界线是什么？',
  '基于你收藏的那篇文章：效率提升并不自动等于认知质量提升。你同意它到什么程度？',
  '有没有一种场景，直接让 AI 给出结论反而更好？这会怎样改变你的观点边界？',
];

function ThinkingView({ navigate, confirmIdea }: { navigate: (v: View) => void; confirmIdea: (idea: Idea) => void }) {
  const [round, setRound] = useState(0); const [answer, setAnswer] = useState(''); const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const submit = () => { if (!answer.trim()) return; setHistory([...history, { q: QUESTIONS[Math.min(round, 2)], a: answer }]); setAnswer(''); setRound((value) => Math.min(value + 1, 3)); };
  const slots = ['核心判断', '原因', '边界', '证据', '反方观点']; const doneCount = Math.min(2 + round, 5);
  return <div className="thinking-page"><header className="thinking-header"><button className="back-link" onClick={() => navigate('topic')}><ArrowLeft /> 选题工作台</button><div><span className="autosave"><Check /> 已自动保存</span><Button variant="outline" onClick={() => navigate('home')}>暂停</Button></div></header><div className="thinking-layout"><section className="conversation"><p className="eyebrow">THINKING PARTNER</p><h1>一起把这个观点想清楚</h1><div className="topic-context"><Sparkles /><div><small>当前选题</small><strong>AI 工具正在从“替你完成”转向“陪你判断”</strong></div></div>{history.map((item, index) => <div className="exchange" key={index}><div className="ai-question"><span>思</span><p>{item.q}</p></div><div className="user-answer">{item.a}</div></div>)}{round < 3 ? <><div className="ai-question current"><span>思</span><div><p>{QUESTIONS[round]}</p><button>为什么问这个？</button></div></div><div className="answer-box"><Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} placeholder="写下你此刻的判断。不需要完整，我们会继续追问。" /><div><button onClick={() => setRound((value) => Math.min(value + 1, 3))}>跳过这个问题</button><Button onClick={submit} className="primary-cta">继续 <ArrowRight /></Button></div></div></> : <div className="ready-card"><Check /><div><h2>你的观点已经具备可用结构</h2><p>可以先确认入库；之后仍可继续补充和修正。</p></div><Button onClick={() => confirmIdea({ id: Date.now(), statement: 'AI 最适合成为判断过程的脚手架：帮助找证据、暴露冲突，但把问题定义与最终结论留给人。', reason: '生成速度已不再稀缺，长期价值来自可解释、可演化的判断。', boundary: '适用于知识型创作；低风险标准任务可以更多委托。', evidence: 6, status: '活跃' })} className="primary-cta">确认 My Idea</Button></div>}</section><aside className="idea-progress"><p className="eyebrow">MY IDEA · 实时整理</p><blockquote>AI 最适合成为判断过程的脚手架，而不是观点的替代者。</blockquote><div className="slot-list">{slots.map((slot, index) => <div className={index < doneCount ? 'done' : ''} key={slot}><span>{index < doneCount ? <Check /> : index + 1}</span><div><strong>{slot}</strong><small>{index < doneCount ? ['一句判断已经清晰', '已有两个主要理由', '已找到适用条件', '已关联 6 条素材', '已保留主要异议'][index] : '还需要想一想'}</small></div></div>)}</div><small className="idea-hint">完成度表示结构是否齐全，不代表观点“正确”。</small></aside></div></div>;
}

function IdeasView({ ideas, navigate }: { ideas: Idea[]; navigate: (v: View) => void }) {
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  return <div className="work-page"><PageHead kicker="MY IDEAS" title="我的观点" description="经你确认的判断，才会成为可复用的观点资产。" action={<Button onClick={() => navigate('thinking')} className="primary-cta"><Plus /> 孵化新观点</Button>} /><div className="idea-filter"><button className="active">全部 {ideas.length}</button><button>活跃</button><button>草稿</button><button>已归档</button></div><div className="ideas-grid">{ideas.map((idea) => <button className="idea-card" key={idea.id} onClick={() => setActiveIdea(idea)}><div><span>{idea.status}</span><MoreHorizontal /></div><blockquote>{idea.statement}</blockquote><p>{idea.reason}</p><footer><span><Link2 /> {idea.evidence} 条证据</span><span>2 个衍生内容</span></footer></button>)}</div>{activeIdea && <div className="idea-drawer"><button className="drawer-close" onClick={() => setActiveIdea(null)} aria-label="关闭"><X /></button><p className="eyebrow">MY IDEA</p><h2>{activeIdea.statement}</h2><section><span>为什么成立</span><p>{activeIdea.reason}</p></section><section><span>适用边界</span><p>{activeIdea.boundary}</p></section><section><span>证据与反方</span><p>已关联 {activeIdea.evidence} 条个人知识，其中包含 1 条反方观点。</p></section><Button onClick={() => { setActiveIdea(null); navigate('create'); }} className="primary-cta">用这个观点创作 <ArrowRight /></Button></div>}</div>;
}

const OUTLINE = [
  ['Hook', '当 AI 能在一分钟内给出一篇完整文章，创作者真正需要保留的是什么？'], ['背景', '生成成本快速下降，但判断质量并没有自动提高。'], ['核心观点', 'AI 应该成为判断过程的脚手架，而不是观点的替代者。'], ['论据一', '问题定义决定了答案的上限，不能被默认外包。'], ['案例', '用“证据—冲突—追问”工作流替代一次性成稿。'], ['反方', '标准化、低风险内容依然适合直接委托 AI。'], ['结论', '把执行交给 AI，把判断留给自己。'],
];

function CreateView({ ideas, setNotice }: { ideas: Idea[]; setNotice: (v: string) => void }) {
  const [platform, setPlatform] = useState('小红书'); const [voice, setVoice] = useState(false); const [draft, setDraft] = useState(false); const [outline, setOutline] = useState(OUTLINE);
  return <div className="create-page"><header className="create-header"><div><p className="eyebrow">CREATE</p><h1>从观点到内容</h1></div><div><span className="autosave"><Check /> 所有更改已保存</span><Button variant="outline">版本 3 <ChevronDown /></Button><Button onClick={() => setNotice('内容已复制，可进入发布流程')} className="primary-cta">导出内容</Button></div></header><div className="create-layout"><aside className="create-left"><label>当前观点<select><option>{ideas[0]?.statement || '选择一个观点'}</option>{ideas.slice(1).map((idea) => <option key={idea.id}>{idea.statement}</option>)}</select></label><section><div><span>已选证据</span><button>管理</button></div>{['答案越容易获得，判断越稀缺', 'AI 可以缩短执行路径，但不能承担判断后果', '效率提升不等于认知质量提升'].map((item, index) => <div className="mini-evidence" key={item}><span>{index + 1}</span><p>{item}</p><Check /></div>)}</section><button className="add-evidence"><Plus /> 从知识库添加证据</button></aside><main className="editor-pane"><div className="platform-tabs">{['小红书', '公众号', '视频脚本'].map((item) => <button key={item} onClick={() => setPlatform(item)} className={platform === item ? 'active' : ''}>{item}</button>)}</div><div className="editor-title"><span>{platform}内容结构</span><small>{platform === '小红书' ? '建议 800–1200 字 · 轻快节奏' : platform === '公众号' ? '建议 1800–2600 字 · 论证完整' : '建议 3–5 分钟 · 口语化'}</small></div>{draft ? <article className="draft-content" contentEditable suppressContentEditableWarning><h2>AI 越会写，人越要学会判断</h2><p>过去我们担心写不出来，现在的问题可能恰好相反：答案来得太快，以至于我们来不及判断它是否值得相信。</p><p>我越来越觉得，AI 最好的位置不是替创作者拥有观点，而是成为判断过程的脚手架。它可以帮我们找到证据、看见冲突、追问边界，但问题定义和最终结论必须留在人手里。</p><h3>为什么判断比生成更重要？</h3><p>生成成本正在快速下降。真正决定一段内容能否建立信任的，是作者为什么这样判断、这个判断在什么条件下成立，以及他是否看见了反方。</p><p>把执行交给 AI，把判断留给自己。或许这才是 AI 时代更可持续的创作方式。</p></article> : <div className="outline-list">{outline.map(([label, text], index) => <div className="outline-item" key={label}><span className="drag">⠿</span><label>{label}</label><Textarea value={text} onChange={(event) => setOutline(outline.map((item, i) => i === index ? [item[0], event.target.value] : item))} rows={2} /></div>)}</div>}<div className="editor-actions"><Button variant="outline" onClick={() => setDraft(false)}>查看结构</Button><Button onClick={() => setDraft(true)} className="primary-cta"><Sparkles /> 生成可编辑初稿</Button></div></main><aside className="create-right"><p className="eyebrow">PLATFORM</p><h3>{platform}适配</h3><div className="setting-row"><span><strong>使用我的表达风格</strong><small>克制、分析型、短标题</small></span><Switch checked={voice} onCheckedChange={setVoice} /></div><div className="setting-block"><span>平台调整</span><ul><li><Check /> {platform === '小红书' ? '开头 3 行建立张力' : platform === '公众号' ? '保留完整论证链条' : '句子更短，适合口播'}</li><li><Check /> 保留个人知识引用</li><li><Check /> 结尾加入轻量行动提示</li></ul></div><div className="version-box"><Clock3 /><div><strong>版本 3</strong><small>刚刚 · 自动保存</small></div><button>回滚</button></div></aside></div></div>;
}

function ProfileView({ setNotice }: { setNotice: (v: string) => void }) {
  const [memory, setMemory] = useState(true); const [web, setWeb] = useState(false); const [tone, setTone] = useState('克制、清晰、分析型');
  return <div className="reading-page profile-page"><PageHead kicker="CREATOR PROFILE" title="创作者画像" description="你可以看到、修改或停用所有 AI 推断。" /><section className="profile-section"><div><h2>创作者身份</h2><p>决定选题与平台适配的基础信息。</p></div><div className="profile-form"><label>创作领域<Input defaultValue="AI、知识管理、内容创作" /></label><label>目标受众<Input defaultValue="希望建立个人观点系统的知识型创作者" /></label><label>内容目标<Input defaultValue="持续输出有个人判断、可复用的深度内容" /></label><label>主要平台<div className="tag-selector"><button className="active">小红书</button><button className="active">公众号</button><button className="active">视频</button></div></label></div></section><section className="profile-section"><div><h2>Creator Voice</h2><p>基于 6 篇历史原创分析，随时可改。</p></div><div className="voice-card"><label>整体语气<Input value={tone} onChange={(event) => setTone(event.target.value)} /></label><div className="voice-samples"><span>标题习惯</span><p>常用问题或反差开头，避免夸张承诺。</p><span>结构偏好</span><p>现象 → 判断 → 理由 → 边界 → 行动。</p><span>避免表达</span><p>“颠覆”“必看”“彻底改变人生”。</p></div><button>查看分析依据</button></div></section><section className="profile-section"><div><h2>记忆与隐私</h2><p>控制系统如何使用你的内容。</p></div><div className="settings-list"><label><span><strong>使用 Creator Memory</strong><small>在选题与追问中参考你的历史关注和观点。</small></span><Switch checked={memory} onCheckedChange={setMemory} /></label><label><span><strong>允许补充 Web</strong><small>仍会在每次搜索前明确询问，不会自动混入。</small></span><Switch checked={web} onCheckedChange={setWeb} /></label><button><span><strong>导出全部数据</strong><small>包含素材、笔记、观点、内容项目和引用关系。</small></span><ArrowRight /></button></div></section><div className="save-profile"><Button onClick={() => setNotice('创作者画像已更新')} className="primary-cta">保存修改</Button></div></div>;
}

function AddSourceDialog({ addSource }: { addSource: (source: Source) => void }) {
  const [done, setDone] = useState(false); const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [url, setUrl] = useState('');
  const submit = (event: { preventDefault: () => void }) => { event.preventDefault(); addSource({ id: Date.now(), title, platform: url.includes('bilibili') ? 'B站' : url.includes('youtube') ? 'YouTube' : url ? '链接' : '手动输入', kind: '收藏', status: 'AI 解析中', date: '刚刚', summary: content.slice(0, 72), tags: ['待整理'] }); setDone(true); };
  return <Dialog onOpenChange={(open) => { if (!open) setTimeout(() => setDone(false), 200); }}><DialogTrigger render={<Button className="add-button" />}><Plus /> 添加素材</DialogTrigger><DialogContent className="source-dialog"><DialogHeader><span className="dialog-icon"><CirclePlus /></span><DialogTitle>添加一份素材</DialogTitle><DialogDescription>粘贴正文或视频链接。原始内容会只读保存，你可以随时补充自己的理解。</DialogDescription></DialogHeader>{done ? <div className="success-state"><span>✓</span><strong>已收录，正在深度理解</strong><p>解析完成后会出现在知识收件箱。</p></div> : <form onSubmit={submit} className="source-form"><label>标题<Input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="给素材一个容易辨认的标题" /></label><label>链接（可选）<Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="小红书、B站或 YouTube 链接" /></label><label>正文或转录<Textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={6} placeholder="粘贴正文、笔记或视频转录…" /></label><div className="dialog-actions"><Button type="submit" className="primary-cta">收录并解析 <ArrowRight /></Button></div></form>}</DialogContent></Dialog>;
}

function MobileNav({ view, navigate }: { view: View; navigate: (v: View) => void }) { return <nav className="mobile-nav" aria-label="移动端主导航">{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={view === item.id ? 'active' : ''}><Icon /><span>{item.label}</span></button>; })}</nav>; }
