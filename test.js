fetch('https://khatm-portal.vercel.app/login').then(r=>r.text()).then(t=>console.log(t.substring(0,200)))
