// Online demo only: on wide screens, show the app at phone width, centered.
const css = `
html, body { background: #e9e6dd; }
@media (min-width: 600px) {
  #root { max-width: 430px; margin: 0 auto; box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 20px 60px rgba(0,0,0,.18); }
}
`;
if (typeof document !== 'undefined') {
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
export {};
