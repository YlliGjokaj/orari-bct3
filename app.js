window.addEventListener('DOMContentLoaded', () => {
  const addLendaForm = document.getElementById('subject-form');
  const lendaTableBody = document.querySelector('#schedule-table tbody');

  function renderTable() {
    lendaTableBody.innerHTML = '';
    const data = JSON.parse(localStorage.getItem('orariLende')) || [];
    data.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.day}</td>
        <td>${item.subject}</td>
        <td>${item.professor}</td>
        <td>${item.time}</td>
        <td>
          <button data-index="${index}" class="fshi-btn" style="padding:4px 8px;background:#e63946;color:white;border:none;border-radius:5px;cursor:pointer">Fshi</button>
        </td>
      `;
      lendaTableBody.appendChild(row);
    });
    updateStats();
  }

  function updateStats() {
    const data = JSON.parse(localStorage.getItem('orariLende')) || [];
    const total = data.length;
    const statsDiv = document.getElementById('stats');
    statsDiv.textContent = `Totali i orëve të regjistruara: ${total}`;
  }

  addLendaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject').value.trim();
    const professor = document.getElementById('professor').value.trim();
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;

    if (!subject || !professor || !day || !time) return;

    const newEntry = { subject, professor, day, time };
    const orariLende = JSON.parse(localStorage.getItem('orariLende')) || [];
    orariLende.push(newEntry);
    localStorage.setItem('orariLende', JSON.stringify(orariLende));
    addLendaForm.reset();
    renderTable();
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fshi-btn')) {
      const index = e.target.getAttribute('data-index');
      const orariLende = JSON.parse(localStorage.getItem('orariLende')) || [];
      orariLende.splice(index, 1);
      localStorage.setItem('orariLende', JSON.stringify(orariLende));
      renderTable();
    }
  });

  // Modal login/register
  const openAuthModal = document.getElementById('open-auth-modal');
  const authModal = document.getElementById('auth-modal');
  const closeAuth = document.getElementById('close-auth');

  openAuthModal.addEventListener('click', () => {
    authModal.style.display = 'flex';
  });

  closeAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
  });

  document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
  
    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    .then(res => {
      if (res.status === 201) {
        alert("Regjistrimi u krye me sukses! Tani mund të hyni.");
        authModal.style.display = 'none';
      } else if (res.status === 409) {
        alert("Ky email është regjistruar më parë!");
      } else {
        alert("Gabim gjatë regjistrimit.");
      }
    });
  });

  
 
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
  
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.name) {
        alert(`Mirë se erdhe ${data.name}!`);
        authModal.style.display = 'none';
      } else {
        alert(data.error || "Gabim gjatë login-it");
      }
    });
  });
  


});

const chatToggle = document.getElementById('chat-toggle');
    const chatBox = document.getElementById('chat-box');
    const closeChat = document.getElementById('close-chat');

    chatToggle.addEventListener('click', () => {
      chatBox.style.display = 'flex';
      chatToggle.style.display = 'none';
    });
    closeChat.addEventListener('click', () => {
      chatBox.style.display = 'none';
      chatToggle.style.display = 'block';
    });

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    let studentName = "";

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;

      const userDiv = document.createElement('div');
      userDiv.innerText = `💭 ${msg}`;
      userDiv.style.cssText = 'margin-bottom:10px;background:#f1f1f1;padding:8px;border-radius:6px;';
      chatMessages.appendChild(userDiv);

      const botDiv = document.createElement('div');
      botDiv.innerText = ' Duke menduar...';
      botDiv.style.cssText = 'margin-bottom:10px;background:#e0f7fa;padding:8px;border-radius:6px;color:#00796b;';
      chatMessages.appendChild(botDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const data = JSON.parse(localStorage.getItem('orariLende')) || [];
      const ditet = ['e hënë','e martë','e mërkurë','e enjte','e premte'];
      const ngarkesa = {};
      data.forEach(d => {
        const dita = d.day?.toLowerCase();
        if (dita) ngarkesa[dita] = (ngarkesa[dita] || 0) + 1;
      });

      setTimeout(() => {
        const q = msg.toLowerCase();
        const ditaNgaPyetja = ditet.find(d => q.includes(d));
        let reply = "Nuk jam i sigurt për këtë.";

        if (q.includes("jam ")) {
          studentName = msg.split("jam")[1].trim();
          reply = `Përshëndetje ${studentName}! Mund të të ndihmoj me orarin.`;
        } else if (q.includes("oraret e mia")) {
          if (!studentName) reply = "Ju lutem shkruani emrin tuaj me 'Jam [emri]' që të kujtoj kush jeni.";
          else {
            const lendet = data.filter(d => d.student?.toLowerCase() === studentName.toLowerCase());
            reply = lendet.length > 0 ? ` Oraret për ${studentName}:
` + lendet.map(l => `${l.subject} (${l.day}, ${l.time})`).join('\n') : `Nuk u gjetën orare për ${studentName}.`;
          }
        } else if (q.includes("cila dit") && q.includes("ngarkuar")) {
          if (Object.keys(ngarkesa).length === 0) reply = 'Nuk ka të dhëna për të analizuar.';
          else {
            const max = Object.keys(ngarkesa).reduce((a,b) => ngarkesa[a]>ngarkesa[b]?a:b);
            reply = ` Dita më e ngarkuar është ${max} me ${ngarkesa[max]} orë.`;
          }
        } else if (q.includes("sa orë") && ditaNgaPyetja) {
          reply = ` Ke ${ngarkesa[ditaNgaPyetja] || 0} orë të regjistruara për ${ditaNgaPyetja}.`;
        } else if ((q.includes("e lirë") || q.includes("ngarkuar")) && ditaNgaPyetja) {
          const nr = ngarkesa[ditaNgaPyetja] || 0;
          reply = nr < 2 ? ` Po, ${ditaNgaPyetja} është ditë me pak ngarkesë (${nr} orë).` : ` ${ditaNgaPyetja} ka ngarkesë (${nr} orë).`;
        } else if (q.includes("çfarë lëndësh") && ditaNgaPyetja) {
          const lendetAsajDite = data.filter(d => d.day.toLowerCase() === ditaNgaPyetja);
          reply = lendetAsajDite.length > 0 ? ` Lëndët e regjistruara të ${ditaNgaPyetja}:
` + lendetAsajDite.map(l => `${l.subject} (${l.time})`).join('\n') : `Nuk ka lëndë të regjistruara të ${ditaNgaPyetja}.`;
        }
        else if (q.includes("më jep një këshillë") || q.includes("motivim")) {
          fetch('https://api.adviceslip.com/advice')
            .then(res => res.json())
            .then(data => {
              botDiv.innerText = ` Këshilla: ${data.slip.advice}`;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(() => {
              botDiv.innerText = " Nuk munda të marr këshillën tani. Provo më vonë.";
            });
          return; 
        }

        

        botDiv.innerText = ` ${reply}`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';
      }, 700);
    });

    const preferencaForm = document.getElementById("preferenca-form");
    preferencaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const ditet = Array.from(document.getElementById("ditetPreferuara").selectedOptions).map(opt => opt.value);
      const koha = document.getElementById("oraPreferuar").value;
      const maxOra = parseInt(document.getElementById("maxOra").value);

      const data = JSON.parse(localStorage.getItem("orariLende")) || [];
      const ngarkesa = {};
      ditet.forEach(d => ngarkesa[d] = 0);
      data.forEach(d => {
        if (ditet.includes(d.day)) ngarkesa[d.day]++;
      });

      const oraretSugjeruar = ditet.filter(d => ngarkesa[d] < maxOra).map(d => `${d} (aktualisht ${ngarkesa[d]} orë)`);

      alert(oraretSugjeruar.length > 0 ? ` AI sugjeron këto ditë: \n${oraretSugjeruar.join("\n")}` : " Nuk u gjet asnjë ditë që përputhet me kriteret e tua.");
    });
