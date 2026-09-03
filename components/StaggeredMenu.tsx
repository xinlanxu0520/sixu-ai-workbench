'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './StaggeredMenu.css';

export type StaggeredMenuItem = {
  id: string;
  label: string;
  ariaLabel: string;
};

type StaggeredMenuProps = {
  items: StaggeredMenuItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  colors?: string[];
  accentColor?: string;
};

export default function StaggeredMenu({
  items,
  activeId,
  onSelect,
  colors = ['#ff4fa3', '#7bdff2'],
  accentColor = '#ff4fa3',
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const [textLines, setTextLines] = useState(['菜单', '关闭']);
  const openRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLDivElement[]>([]);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const layers = preLayersRef.current
        ? Array.from(preLayersRef.current.querySelectorAll<HTMLDivElement>('.sm-prelayer'))
        : [];
      preLayerElsRef.current = layers;
      if (!panel || !iconRef.current || !textInnerRef.current) return;
      gsap.set([panel, ...layers], { xPercent: 100, opacity: 1 });
      gsap.set(preLayersRef.current, { xPercent: 0, opacity: 1 });
      gsap.set(iconRef.current, { rotation: 0, transformOrigin: '50% 50%' });
      gsap.set(textInnerRef.current, { yPercent: 0 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const animateText = useCallback((opening: boolean) => {
    if (!textInnerRef.current) return;
    textTweenRef.current?.kill();
    const current = opening ? '菜单' : '关闭';
    const target = opening ? '关闭' : '菜单';
    const sequence = [current];
    let last = current;
    for (let index = 0; index < 3; index += 1) {
      last = last === '菜单' ? '关闭' : '菜单';
      sequence.push(last);
    }
    if (last !== target) sequence.push(target);
    sequence.push(target);
    setTextLines(sequence);
    gsap.set(textInnerRef.current, { yPercent: 0 });
    textTweenRef.current = gsap.to(textInnerRef.current, {
      yPercent: -((sequence.length - 1) / sequence.length) * 100,
      duration: 0.5 + sequence.length * 0.07,
      ease: 'power4.out',
    });
  }, []);

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || busyRef.current) return;
    busyRef.current = true;
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    const labels = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemLabel'));
    const numbered = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-item'));
    const footer = panel.querySelector<HTMLElement>('.sm-panel-footer');
    gsap.set(labels, { yPercent: 140, rotation: 10 });
    gsap.set(numbered, { '--sm-num-opacity': 0 });
    if (footer) gsap.set(footer, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true, onComplete: () => { busyRef.current = false; } });
    preLayerElsRef.current.forEach((layer, index) => {
      tl.fromTo(layer, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, index * 0.07);
    });
    const panelStart = Math.max(0, (preLayerElsRef.current.length - 1) * 0.07) + 0.08;
    tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, panelStart)
      .to(labels, { yPercent: 0, rotation: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, panelStart + 0.0975)
      .to(numbered, { '--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, panelStart + 0.1975);
    if (footer) tl.to(footer, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, panelStart + 0.26);
    openTlRef.current = tl;
    tl.play(0);
  }, []);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([...preLayerElsRef.current, panel], {
      xPercent: 100,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => { busyRef.current = false; },
    });
  }, []);

  const setMenuState = useCallback((next: boolean) => {
    openRef.current = next;
    setOpen(next);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([...preLayerElsRef.current, panelRef.current], { xPercent: next ? 0 : 100, opacity: 1 });
    } else {
      if (next) playOpen(); else playClose();
      spinTweenRef.current?.kill();
      spinTweenRef.current = gsap.to(iconRef.current, {
        rotation: next ? 225 : 0,
        duration: next ? 0.8 : 0.35,
        ease: next ? 'power4.out' : 'power3.inOut',
        overwrite: 'auto',
      });
      animateText(next);
    }
  }, [animateText, playClose, playOpen]);

  const closeMenu = useCallback(() => {
    if (openRef.current) setMenuState(false);
  }, [setMenuState]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleBtnRef.current?.contains(target)) closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu(); };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, open]);

  useEffect(() => () => {
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    spinTweenRef.current?.kill();
    textTweenRef.current?.kill();
  }, []);

  return (
    <div
      ref={rootRef}
      className="staggered-menu-wrapper fixed-wrapper"
      style={{ '--sm-accent': accentColor } as React.CSSProperties}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.slice(0, 2).map((color) => <div className="sm-prelayer" style={{ background: color }} key={color} />)}
      </div>
      <header className="staggered-menu-header" aria-label="主导航栏">
        <button className="sm-logo" type="button" onClick={() => { onSelect('home'); closeMenu(); }} aria-label="回到首页">
          <span className="sm-logo-mark">思</span><span>思序</span>
        </button>
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          type="button"
          onClick={() => setMenuState(!openRef.current)}
        >
          <span className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((line, index) => <span className="sm-toggle-line" key={`${line}-${index}`}>{line}</span>)}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true"><span /><span /></span>
        </button>
      </header>
      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list">
            {items.map((item) => (
              <li className="sm-panel-itemWrap" key={item.id}>
                <button
                  className="sm-panel-item"
                  type="button"
                  data-index={items.indexOf(item) + 1}
                  aria-label={item.ariaLabel}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={() => { onSelect(item.id); closeMenu(); }}
                >
                  <span className="sm-panel-itemLabel">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="sm-panel-footer">
            <span>思考不是存储</span>
            <strong>让每条信息都有去处</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
