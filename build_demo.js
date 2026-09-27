// build_demo.js — Transforms City International demo into Universal School Demo
const fs = require('fs');

let c = fs.readFileSync('EduVault_City_International_Demo.html', 'utf8');

// 1. Title
c = c.replace(
  '<title>EduVault AI \u2014 City International School Demo Presentation</title>',
  '<title>EduVault AI \u2014 Universal School Sales Demo</title>'
);

// 2. Header school tag — inject dynamic span + edit button
c = c.replace(
  '<div class="school-tag">\n      Partner Presentation: <span>City International School</span>\n    </div>',
  `<div class="school-tag">
      Partner Presentation: <span id="headerSchoolName">\u2014</span>
      <button id="editSchoolBtn" onclick="showModal()" style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);color:#38BDF8;font-size:11px;font-weight:700;padding:4px 9px;border-radius:6px;cursor:pointer;margin-left:4px;">Edit</button>
    </div>`
);

// 3. Slide 1 headline — add id
c = c.replace(
  'Empowering <span class="highlight-cyan">City International School</span>',
  'Empowering <span class="highlight-cyan" id="slide1SchoolName">Your School</span>'
);

// 4. Slide 6 closing offer — add id
c = c.replace(
  '<span class="highlight-cyan">City International School</span>\n        </h1>\n        <p class="subtext" style="margin: 0 auto 28px auto;">\n          Hum chahte hain ki City International School hamara premier showcase partner bane.',
  `<span class="highlight-cyan" id="slide7SchoolName">Your School</span>
        </h1>
        <p class="subtext" style="margin: 0 auto 28px auto;">
          Hum chahte hain ki aapka school hamara premier showcase partner bane. Isliye no advance, zero risk.`
);

// 5. Replace all remaining City International references
c = c.replace(/City International School/g, 'Your School');

// 6. Inject school name entry modal right after body tag
const modal = `
  <!-- School Name Entry Modal -->
  <div id="schoolModal" style="position:fixed;inset:0;z-index:9999;background:rgba(7,11,20,0.97);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(20px);">
    <div style="background:rgba(16,24,40,0.95);border:1px solid rgba(6,182,212,0.4);border-radius:24px;padding:48px 52px;max-width:500px;width:90%;text-align:center;box-shadow:0 0 80px rgba(6,182,212,0.15);">
      <div style="width:50px;height:50px;background:linear-gradient(135deg,#06B6D4,#3B82F6);border-radius:13px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;color:#fff;margin:0 auto 18px;">E</div>
      <div style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;background:linear-gradient(135deg,#fff 30%,#94A3B8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">EduVault<span style="color:#38BDF8;">.AI</span> Demo</div>
      <p style="font-size:13px;color:#64748B;margin-bottom:28px;line-height:1.5;">School ka naam enter karo. Presentation automatically personalize ho jayegi kisi bhi school ke liye.</p>
      <div style="text-align:left;font-size:11px;font-weight:700;color:#06B6D4;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:7px;">School Name</div>
      <input type="text" id="schoolNameInput" placeholder="e.g. Delhi Public School, St. Xavier's Academy..." style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-size:15px;font-weight:600;padding:13px 16px;outline:none;margin-bottom:20px;box-sizing:border-box;" autocomplete="off" />
      <div style="text-align:left;font-size:11px;font-weight:700;color:#06B6D4;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:7px;">City (Optional)</div>
      <input type="text" id="schoolCityInput" placeholder="e.g. Jaipur, Delhi, Lucknow, Pune..." style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-size:15px;font-weight:600;padding:13px 16px;outline:none;margin-bottom:24px;box-sizing:border-box;" autocomplete="off" />
      <button onclick="startDemo()" style="width:100%;background:linear-gradient(135deg,#06B6D4,#3B82F6);border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;padding:15px;cursor:pointer;box-shadow:0 0 20px rgba(6,182,212,0.35);">Launch Personalized Demo</button>
      <div style="font-size:11px;color:#475569;margin-top:12px;">No data saved. Sirf is session ke liye use hoga.</div>
    </div>
  </div>
`;
c = c.replace('<div class="glow-sphere-1">', modal + '\n\n  <div class="glow-sphere-1">');

// 7. Replace JS entirely with dynamic version
const oldJsMatch = c.match(/<script>[\s\S]*?<\/script>/);
if (oldJsMatch) {
  const newJS = `<script>
    let SCHOOL_NAME = 'Your School';
    let SCHOOL_CITY = '';

    function startDemo() {
      const n = document.getElementById('schoolNameInput').value.trim();
      const ci = document.getElementById('schoolCityInput').value.trim();
      if (!n) { document.getElementById('schoolNameInput').style.borderColor = '#EF4444'; return; }
      SCHOOL_NAME = n; SCHOOL_CITY = ci;
      applySchoolName();
      document.getElementById('schoolModal').style.display = 'none';
      updateSlide();
    }

    function showModal() {
      document.getElementById('schoolNameInput').value = SCHOOL_NAME;
      document.getElementById('schoolCityInput').value = SCHOOL_CITY;
      document.getElementById('schoolModal').style.display = 'flex';
    }

    function applySchoolName() {
      ['headerSchoolName', 'slide1SchoolName', 'slide7SchoolName'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = SCHOOL_NAME;
      });
      document.title = 'EduVault AI \u2014 ' + SCHOOL_NAME + ' Demo';
    }

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;

    function getNotes() {
      const S = SCHOOL_NAME;
      const C = SCHOOL_CITY ? ', ' + SCHOOL_CITY : '';
      return [
        '<b>Opening Hook:</b> Namaste Sir/Maam! <b>' + S + '</b>' + C + ' education mein already ek landmark hai. Aaj hum koi boring software dikhane nahi aaye \u2014 hum laye hain EduVault AI, jo school ka admission rate badhata hai aur staff ka daily 2 ghanta manual kaam automate karta hai.',
        '<b>Hero Dashboard:</b> Sir, yeh dekh rahe hain? <b>' + S + '</b> ka pure school ka live control center. Admission kitne pending hain, attendance status kya hai, aur academics mein kaunse section ko attention chahiye \u2014 sab 1-click mein milta hai. Koi files palatne ki zaroorat nahi.',
        '<b>WhatsApp Automation:</b> Sir, yeh humara sabse favourite feature hai. 98% parents WhatsApp check karte hain. EduVault ke zariye <b>' + S + '</b> ke parents ko WhatsApp par instant admission enquiry details, daily attendance, aur direct UPI Fee link milta hai. Fee recovery 3X fast ho jati hai!',
        '<b>Principal Cockpit:</b> Sir, yeh special Cockpit aapke aur Director Sir ke liye banaya gaya hai. Aap chahe <b>' + S + '</b> mein ho ya out of station \u2014 tablet ya phone par aapko live pata chalega kitna fee collection hua aur school attendance ka percentage kya hai.',
        '<b>Comparison:</b> Sir, puraane ERP software sirf data store karte the aur staff par bojh badhate the. EduVault AI <b>' + S + '</b> ko proactively operate karta hai aur admissions boost karta hai. Koi bhi competitor yeh AI-powered automation offer nahi karta.',
        '<b>Closing Pitch:</b> Sir, hum <b>' + S + '</b> ko hamara exclusive partner school banana chahte hain. Isliye hum aapko 14 days ka bilkul FREE Pilot setup karke denge. Aap khud result dekhiye, phir decide kijiye. Kya hum next Monday se onboarding start karein?'
      ];
    }

    function updateSlide() {
      slides.forEach(function(slide, index) {
        slide.classList.toggle('active', index === currentSlide);
      });
      document.getElementById('slideNumber').innerText = (currentSlide + 1) + ' / ' + totalSlides;
      document.getElementById('speakerNotes').innerHTML = getNotes()[currentSlide];
      document.getElementById('progressFill').style.width = (((currentSlide + 1) / totalSlides) * 100) + '%';
      document.getElementById('prevBtn').disabled = currentSlide === 0;
      document.getElementById('nextBtn').innerText = currentSlide === totalSlides - 1 ? 'Finish' : 'Next \u2192';
    }

    function nextSlide() { if (currentSlide < totalSlides - 1) { currentSlide++; updateSlide(); } }
    function prevSlide() { if (currentSlide > 0) { currentSlide--; updateSlide(); } }

    function toggleFullScreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
    }

    window.addEventListener('keydown', function(e) {
      if (document.getElementById('schoolModal').style.display !== 'none') {
        if (e.key === 'Enter') startDemo();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'f' || e.key === 'F') toggleFullScreen();
    });

    updateSlide();
  </script>`;
  c = c.replace(oldJsMatch[0], newJS);
}

fs.writeFileSync('EduVault_Universal_Sales_Demo.html', c, 'utf8');
const remaining = (c.match(/City International/g) || []).length;
console.log('Universal demo created! CI mentions remaining:', remaining);
console.log('File size:', c.length, 'bytes');
