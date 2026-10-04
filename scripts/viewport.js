/* Bug do iOS no PWA instalado: na primeira vez que o teclado abre, a janela
   do app encolhe a altura da barra de status (59px no iPhone medido: tela
   852, innerHeight 793) e não volta até o app ser fechado à força. O iOS
   deixa de desenhar essa faixa, e a barra de navegação fica suspensa sobre
   uma faixa preta.
   Esconder e reexibir o body força o iOS a remedir a janela. Isso é feito
   quando o teclado fecha e quando o app volta ao primeiro plano, só se a
   janela estiver menor do que a tela e nenhum campo estiver em edição.
   Referência: https://dev.to/cederhook/fixing-the-ios-standalone-pwa-keyboard-bug-that-shrinks-your-viewport-for-good-63d */
(function(){
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (!standalone) return;

  let maior = window.innerHeight;
  window.vpReparos = { tentativas: 0, ultimo: "" };

  function esperado(){
    // retrato: a janela do PWA deve ocupar a tela inteira
    const tela = window.innerWidth < window.innerHeight ? screen.height : screen.width;
    return Math.max(maior, tela);
  }

  function editando(){
    const el = document.activeElement;
    return !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  }

  function reparar(){
    if (editando()) return;
    const antes = window.innerHeight;
    if (esperado() - antes <= 4) return;
    const rolagem = document.getElementById("contentViewport");
    const topo = rolagem ? rolagem.scrollTop : 0;
    document.body.style.display = "none";
    void document.body.offsetHeight;
    document.body.style.display = "";
    if (rolagem) rolagem.scrollTop = topo;
    window.vpReparos.tentativas++;
    requestAnimationFrame(() => {
      window.vpReparos.ultimo = antes + "→" + window.innerHeight;
    });
  }

  addEventListener("resize", () => { maior = Math.max(maior, window.innerHeight); });
  document.addEventListener("focusout", () => setTimeout(reparar, 140));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(reparar, 140); });
  addEventListener("pageshow", () => setTimeout(reparar, 140));
  window.vpReparar = reparar;
})();
