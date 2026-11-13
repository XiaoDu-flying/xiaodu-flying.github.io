/* Homepage integration for https://github.com/ZhengLinLei/cursor-swarm.js */
(() => {
  'use strict';

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !window.CursorSwarm || location.hash) return;

  const button = document.createElement('button');
  button.className = 'swarm-skip';
  button.type = 'button';
  button.textContent = 'Skip animation';
  button.setAttribute('data-cs-ignore', '');
  document.body.appendChild(button);

  let swarm;
  let timeout;
  const finish = () => {
    clearTimeout(timeout);
    swarm?.stop();
    button.remove();
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('focusin', finish);
    motion.removeEventListener('change', finish);
  };
  const onKey = event => {
    if (event.key === 'Escape') finish();
  };

  button.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  // Reveal content immediately when a visitor navigates by keyboard.
  document.addEventListener('focusin', finish);
  motion.addEventListener('change', finish);

  try {
    swarm = new CursorSwarm({
      root: '.wrapper',
      cursors: 3,
      names: ['RESEARCH', 'BUILDER', 'EDITOR'],
      colors: ['#285f98', '#378577', '#9865aa'],
      ignore: '.site-footnote, .skip-link',
      deconstruct: false,
      startPosition: 'corners',
      exitAfterBuild: true,
      idle: 'hide',
      speed: 2,
      typeDuration: 0.65,
      hud: false,
      guides: false,
      sparks: false,
      respectReducedMotion: true,
      onDone: () => setTimeout(finish, 300)
    });
    swarm.init();
    // A long academic page must never leave content waiting indefinitely.
    timeout = setTimeout(finish, 20000);
  } catch (error) {
    finish();
    console.warn('CursorSwarm could not start:', error);
  }
})();
