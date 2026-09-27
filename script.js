document.addEventListener('DOMContentLoaded', () => {

  /* ---- Typewriter hero name ---- */
  const target = document.getElementById('typedName');
  const fullText = 'Mattia "LuxTech" Vacca';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (target) {
    if (prefersReducedMotion) {
      target.textContent = fullText;
    } else {
      let i = 0;
      const type = () => {
        target.textContent = fullText.slice(0, i);
        i++;
        if (i <= fullText.length) {
          setTimeout(type, 45);
        }
      };
      type();
    }
  }

  /* ---- Mobile nav toggle ---- */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('sideNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Boot sequence (plays once per browser session) ---- */
  const bootScreen = document.getElementById('bootScreen');
  const bootLines = document.getElementById('bootLines');

  if (bootScreen && bootLines) {
    const skipBoot = prefersReducedMotion || sessionStorage.getItem('bootPlayed');

    if (skipBoot) {
      bootScreen.remove();
    } else {
      document.body.classList.add('boot-lock');
      const lines = [
        'booting luxtech@portfolio ...',
        'loading modules ... [ok]',
        'mounting /home /about /skills /projects /reviews /contact ... [ok]',
        'session ready — welcome.'
      ];
      let li = 0, ci = 0, currentP = document.createElement('p');
      currentP.className = 'boot-line';
      bootLines.appendChild(currentP);

      const typeChar = () => {
        const line = lines[li];
        if (ci <= line.length) {
          currentP.textContent = line.slice(0, ci);
          ci++;
          setTimeout(typeChar, 16);
        } else {
          li++;
          ci = 0;
          if (li < lines.length) {
            currentP = document.createElement('p');
            currentP.className = 'boot-line';
            bootLines.appendChild(currentP);
            setTimeout(typeChar, 140);
          } else {
            sessionStorage.setItem('bootPlayed', '1');
            setTimeout(() => {
              bootScreen.classList.add('boot-hide');
              document.body.classList.remove('boot-lock');
              setTimeout(() => bootScreen.remove(), 500);
            }, 550);
          }
        }
      };
      typeChar();
    }
  }

  /* ---- Certifications: built-in image/PDF viewer ---- */
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const certs = [
    { title: 'CompTIA Network+', issuer: 'CompTIA', date: '2026', file: 'assets/certs/HACCP 20 ore.pdf' },
    { title: 'Pre Security', issuer: 'TryHackMe', date: '2022', file: 'assets/certs/PRE SECURITY CERTIFICATE.png' }
  ];

  const certsGrid = document.getElementById('certsGrid');
  const certModal = document.getElementById('certModal');
  const certModalBody = document.getElementById('certModalBody');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalMeta = document.getElementById('certModalMeta');
  const certModalClose = document.getElementById('certModalClose');
  const certPrev = document.getElementById('certPrev');
  const certNext = document.getElementById('certNext');

  if (certsGrid && certModal && certs.length) {
    let certCurrent = 0;
    let lastFocused = null;

    const fileType = (file) => (file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image');

    async function renderPdfThumb(file, thumbEl) {
      thumbEl.innerHTML = '<span class="cert-thumb-label">PDF</span>';
      if (!window.pdfjsLib) return;
      try {
        const pdf = await pdfjsLib.getDocument(encodeURI(file)).promise;
        const page = await pdf.getPage(1);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = 260 / unscaled.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        thumbEl.innerHTML = '';
        thumbEl.appendChild(canvas);
      } catch (err) {
        thumbEl.innerHTML = '<span class="cert-thumb-label">PDF</span>';
      }
    }

    certs.forEach((cert, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cert-card';

      const thumb = document.createElement('span');
      thumb.className = 'cert-thumb';
      if (fileType(cert.file) === 'pdf') {
        renderPdfThumb(cert.file, thumb);
      } else {
        const img = document.createElement('img');
        img.src = encodeURI(cert.file);
        img.alt = cert.title;
        img.loading = 'lazy';
        thumb.appendChild(img);
      }

      const info = document.createElement('span');
      info.className = 'cert-card-info';
      info.innerHTML = `<span class="cert-card-title">${cert.title}</span><span class="cert-card-issuer">${cert.issuer} · ${cert.date}</span>`;

      card.appendChild(thumb);
      card.appendChild(info);
      card.addEventListener('click', () => openCert(i, card));
      certsGrid.appendChild(card);
    });

    function renderCert() {
      const cert = certs[certCurrent];
      certModalTitle.textContent = cert.file.split('/').pop();
      certModalMeta.textContent = `${cert.title} — ${cert.issuer}, ${cert.date} · ${certCurrent + 1}/${certs.length}`;
      certModalBody.innerHTML = '';

      if (fileType(cert.file) === 'pdf') {
        const embed = document.createElement('embed');
        embed.src = encodeURI(cert.file);
        embed.type = 'application/pdf';
        certModalBody.appendChild(embed);
      } else {
        const img = document.createElement('img');
        img.src = encodeURI(cert.file);
        img.alt = cert.title;
        certModalBody.appendChild(img);
      }
    }

    function openCert(i, triggerEl) {
      certCurrent = i;
      lastFocused = triggerEl || document.activeElement;
      renderCert();
      certModal.classList.add('open');
      certModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      certModalClose.focus();
    }

    function closeCert() {
      certModal.classList.remove('open');
      certModal.setAttribute('aria-hidden', 'true');
      certModalBody.innerHTML = '';
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    function stepCert(dir) {
      certCurrent = (certCurrent + dir + certs.length) % certs.length;
      renderCert();
    }

    certModalClose.addEventListener('click', closeCert);
    certPrev.addEventListener('click', () => stepCert(-1));
    certNext.addEventListener('click', () => stepCert(1));

    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCert();
    });

    document.addEventListener('keydown', (e) => {
      if (!certModal.classList.contains('open')) return;
      if (e.key === 'Escape') closeCert();
      if (e.key === 'ArrowLeft') stepCert(-1);
      if (e.key === 'ArrowRight') stepCert(1);
    });
  }

  /* ---- GitHub activity feed ---- */
  const activityList = document.getElementById('activityList');
  const GH_ORG = 'GNU-LuxTech';

  if (activityList) {
    const timeAgo = (dateStr) => {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(diffMs / 86400000);
      if (days < 1) return 'today';
      if (days === 1) return '1 day ago';
      if (days < 30) return `${days} days ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} mo ago`;
      return `${Math.floor(months / 12)} yr ago`;
    };

    fetch(`https://api.github.com/users/${GH_ORG}/repos?sort=pushed&per_page=5`)
      .then((res) => {
        if (!res.ok) throw new Error('GitHub API request failed');
        return res.json();
      })
      .then((repos) => {
        if (!Array.isArray(repos) || !repos.length) throw new Error('No repos returned');

        activityList.innerHTML = '';
        repos.forEach((repo) => {
          const li = document.createElement('li');
          const lang = repo.language ? `<span class="activity-lang">${repo.language}</span> · ` : '';
          li.innerHTML = `
            <span class="activity-repo"><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></span>
            <span class="activity-meta">${lang}updated ${timeAgo(repo.pushed_at)}${repo.description ? ' — ' + repo.description : ''}</span>
          `;
          activityList.appendChild(li);
        });
      })
      .catch(() => {
        activityList.innerHTML = `<li class="activity-error">Couldn't load live activity — <a href="https://github.com/${GH_ORG}" target="_blank" rel="noopener">view on GitHub</a> directly.</li>`;
      });
  }

  /* ---- Reviews: terminal browser ---- */
  const reviews = [
    {
      text: '"Placeholder review — swap this for real feedback from a collaborator, client, or professor."',
      meta: 'Name Surname — Role, Company'
    },
    {
      text: '"Placeholder review — swap this for real feedback from a collaborator, client, or professor."',
      meta: 'Name Surname — Role, Company'
    },
    {
      text: '"Placeholder review — swap this for real feedback from a collaborator, client, or professor."',
      meta: 'Name Surname — Role, Company'
    }
  ];

  const reviewSection = document.getElementById('reviews');
  const reviewText = document.getElementById('reviewText');
  const reviewMeta = document.getElementById('reviewMeta');
  const reviewIndexEl = document.getElementById('reviewIndex');
  const reviewTotalEl = document.getElementById('reviewTotal');
  const reviewDots = document.getElementById('reviewDots');
  const reviewPrev = document.getElementById('reviewPrev');
  const reviewNext = document.getElementById('reviewNext');

  if (reviewSection && reviewText && reviews.length) {
    let current = 0;

    reviewTotalEl.textContent = reviews.length;

    reviews.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'review-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Show review ${i + 1}`);
      dot.addEventListener('click', () => showReview(i));
      reviewDots.appendChild(dot);
    });

    const showReview = (i) => {
      current = (i + reviews.length) % reviews.length;
      reviewText.classList.add('is-swapping');
      reviewMeta.classList.add('is-swapping');

      setTimeout(() => {
        reviewText.textContent = reviews[current].text;
        reviewMeta.textContent = reviews[current].meta;
        reviewIndexEl.textContent = current + 1;
        [...reviewDots.children].forEach((dot, idx) => {
          dot.classList.toggle('active', idx === current);
        });
        reviewText.classList.remove('is-swapping');
        reviewMeta.classList.remove('is-swapping');
      }, 140);
    };

    reviewPrev.addEventListener('click', () => showReview(current - 1));
    reviewNext.addEventListener('click', () => showReview(current + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const rect = reviewSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (!inView) return;
      if (e.key === 'ArrowLeft') showReview(current - 1);
      if (e.key === 'ArrowRight') showReview(current + 1);
    });

    // initial render (no fade on first paint)
    reviewText.textContent = reviews[0].text;
    reviewMeta.textContent = reviews[0].meta;
  }

  /* ---- Scroll-spy: highlight active section in nav ---- */
  const sections = document.querySelectorAll('main .section');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.target === id);
    });
  };

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }

});
