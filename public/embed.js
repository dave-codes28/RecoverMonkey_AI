(function() {
  const script = document.currentScript;
  const shopDomain = script.getAttribute('data-shop-domain');
  const div = document.createElement('div');
  div.id = 'recovermonkey-chatbot';
  document.body.appendChild(div);

  // TODO: Update this URL to your actual deployed embed script location
  const scriptUrl = 'https://yourdomain.com/embed-script.js';
  const newScript = document.createElement('script');
  newScript.src = scriptUrl;
  newScript.async = true;
  document.body.appendChild(newScript);
})(); 