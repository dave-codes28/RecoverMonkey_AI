(function () {
  const script = document.currentScript;
  const shopDomain = script.getAttribute('data-shop-domain');
  const div = document.createElement('div');
  div.id = 'recovermonkey-chatbot';
  document.body.appendChild(div);

  // TODO: Replace with your deployed Next.js widget bundle URL after deployment
  const scriptUrl = 'https://yourdomain.com/_next/static/chunks/pages/index.js';
  const reactScript = document.createElement('script');
  reactScript.src = scriptUrl;
  reactScript.onload = () => {
    // TODO: Mount your React widget here. This is a placeholder for actual widget mounting logic.
    // For example, if you expose a global mount function from your bundle:
    // window.mountRecoverMonkeyChatbot(div, { shopId: shopDomain });
    // Or use ReactDOM to render into div
    // This part depends on your build/export setup.
  };
  document.body.appendChild(reactScript);

  // Exit intent trigger
  let exitIntentTriggered = false;
  document.addEventListener('mouseleave', (e) => {
    if (!exitIntentTriggered && e.clientY < 0) {
      exitIntentTriggered = true;
      div.style.display = 'block'; // Show chatbot on exit intent
    }
  });

  // Initially hidden
  div.style.display = 'none';
})(); 