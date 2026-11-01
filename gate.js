// Zugang: Code aus dem PDF oder persönlicher Geschenklink
window.KZ_H='a8949600b5a8ee458bf94568cc40447814f120c24d0bd1b02498ddb4123a0b7f';
window.kzSha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
window.kzNormCode=s=>(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
window.kzSig=async(an,von,msg)=>(await kzSha(KZ_H+'|'+an+'|'+von+'|'+(msg||''))).slice(0,12);
window.kzEnc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
window.kzDec=g=>JSON.parse(decodeURIComponent(escape(atob(g.replace(/-/g,'+').replace(/_/g,'/')))));
