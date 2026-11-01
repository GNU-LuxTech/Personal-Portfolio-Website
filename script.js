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
        'mounting /home /shell /about /skills /projects /reviews /contact ... [ok]',
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
    { title: 'CompTIA Network+ ce', issuer: 'CompTIA', date: '2026', file: 'assets/certs/CompTIA Network+ ce certificate.pdf' },
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

  /* ---- Reviews: terminal browser with live approved GitHub Issues & Web3Forms ---- */
  const defaultReviews = [
    {
      rating: 5,
      text: '"Mattia demonstrated incredible attention to detail in our network architecture setup and privacy-oriented protocol design. Highly recommend!"',
      meta: 'Alex M. — Systems Developer · Oct 2026'
    },
    {
      rating: 5,
      text: '"Clean, modular Go code and strong fundamentals in applied cryptography and Tor onion services. Great peer to collaborate with."',
      meta: 'Marco B. — Software Engineer · Sep 2026'
    },
    {
      rating: 5,
      text: '"Fast turnaround, clear communication, and deeply invested in understanding how low-level systems function under the hood."',
      meta: 'David K. — Network Engineer · Aug 2026'
    }
  ];

  let reviews = [...defaultReviews];

  const reviewSection = document.getElementById('reviews');
  const reviewText = document.getElementById('reviewText');
  const reviewMeta = document.getElementById('reviewMeta');
  const reviewStars = document.getElementById('reviewStars');
  const reviewIndexEl = document.getElementById('reviewIndex');
  const reviewTotalEl = document.getElementById('reviewTotal');
  const reviewDots = document.getElementById('reviewDots');
  const reviewPrev = document.getElementById('reviewPrev');
  const reviewNext = document.getElementById('reviewNext');

  let currentReview = 0;

  const renderStars = (rating) => {
    const count = Math.max(1, Math.min(5, Number(rating) || 5));
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  };

  const showReview = (i) => {
    if (!reviews.length) return;
    currentReview = (i + reviews.length) % reviews.length;
    reviewText.classList.add('is-swapping');
    reviewMeta.classList.add('is-swapping');
    if (reviewStars) reviewStars.classList.add('is-swapping');

    setTimeout(() => {
      reviewText.textContent = reviews[currentReview].text;
      reviewMeta.textContent = reviews[currentReview].meta;
      if (reviewStars) {
        reviewStars.textContent = renderStars(reviews[currentReview].rating);
        reviewStars.classList.remove('is-swapping');
      }
      reviewIndexEl.textContent = currentReview + 1;
      [...reviewDots.children].forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentReview);
      });
      reviewText.classList.remove('is-swapping');
      reviewMeta.classList.remove('is-swapping');
    }, 140);
  };

  const buildReviewDots = () => {
    reviewDots.innerHTML = '';
    reviewTotalEl.textContent = reviews.length;
    reviews.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'review-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Show review ${i + 1}`);
      dot.addEventListener('click', () => showReview(i));
      reviewDots.appendChild(dot);
    });
  };

  if (reviewSection && reviewText) {
    buildReviewDots();
    reviewText.textContent = reviews[0].text;
    reviewMeta.textContent = reviews[0].meta;
    if (reviewStars) reviewStars.textContent = renderStars(reviews[0].rating);

    reviewPrev.addEventListener('click', () => showReview(currentReview - 1));
    reviewNext.addEventListener('click', () => showReview(currentReview + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const rect = reviewSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (!inView) return;
      if (e.key === 'ArrowLeft') showReview(currentReview - 1);
      if (e.key === 'ArrowRight') showReview(currentReview + 1);
    });

    // Fetch approved reviews from GitHub Issues (either labeled 'approved' OR closed as completed)
    fetch('https://api.github.com/repos/GNU-LuxTech/Personal-Portfolio-Website/issues?state=all&per_page=30')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
      })
      .then((issues) => {
        if (!Array.isArray(issues) || !issues.length) return;
        const liveReviews = [];

        issues.forEach((issue) => {
          // Check if issue is approved: has 'approved' label OR closed as completed
          const hasApprovedLabel = issue.labels && issue.labels.some((l) => l.name.toLowerCase() === 'approved');
          const isClosedCompleted = issue.state === 'closed' && (issue.state_reason === 'completed' || !issue.state_reason);
          const isReview = (issue.title && issue.title.toLowerCase().startsWith('[review]')) || hasApprovedLabel;

          if (!isReview || (!hasApprovedLabel && !isClosedCompleted)) return;
          try {
            // Check if issue body contains JSON block
            const jsonMatch = issue.body && issue.body.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[1]);
              if (parsed.text && parsed.name) {
                liveReviews.push({
                  rating: Number(parsed.rating) || 5,
                  text: parsed.text.startsWith('"') ? parsed.text : `"${parsed.text}"`,
                  meta: `${parsed.name}${parsed.role ? ' — ' + parsed.role : ''}`
                });
                return;
              }
            }
          } catch (_) { }

          // Fallback parsing for non-JSON formatted issue bodies
          if (issue.body) {
            liveReviews.push({
              rating: 5,
              text: `"${issue.body.slice(0, 300)}"`,
              meta: `${issue.title.replace(/^\[Review\]\s*/i, '')} · GitHub`
            });
          }
        });

        if (liveReviews.length) {
          reviews = liveReviews;
          currentReview = 0;
          buildReviewDots();
          showReview(0);
        }
      })
      .catch(() => {
        // Keeps defaultReviews on network/rate-limit error
      });
  }

  /* ---- Review Submission Modal & Form (Web3Forms + GitHub Issues helper) ---- */
  const reviewModal = document.getElementById('reviewModal');
  const openReviewModal = document.getElementById('openReviewModal');
  const reviewModalClose = document.getElementById('reviewModalClose');
  const reviewCancel = document.getElementById('reviewCancel');
  const reviewForm = document.getElementById('reviewForm');
  const starPicker = document.getElementById('starPicker');
  const revRatingInput = document.getElementById('revRating');
  const reviewStatus = document.getElementById('reviewStatus');
  const reviewSubmitBtn = document.getElementById('reviewSubmitBtn');

  // Replace with your Web3Forms Access Key (free at web3forms.com)
  const WEB3FORMS_KEY = '52ee8198-259d-40ba-9aff-7a89e98fbaec';

  if (reviewModal && openReviewModal) {
    const openModal = () => {
      reviewModal.classList.add('open');
      reviewModal.setAttribute('aria-hidden', 'false');
      reviewStatus.textContent = '';
      reviewStatus.className = 'review-form-status';
      const firstInput = document.getElementById('revName');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    };

    const closeModal = () => {
      reviewModal.classList.remove('open');
      reviewModal.setAttribute('aria-hidden', 'true');
    };

    openReviewModal.addEventListener('click', openModal);
    if (reviewModalClose) reviewModalClose.addEventListener('click', closeModal);
    if (reviewCancel) reviewCancel.addEventListener('click', closeModal);

    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (reviewModal.classList.contains('open') && e.key === 'Escape') closeModal();
    });

    // Star picker rating selection
    if (starPicker && revRatingInput) {
      const starBtns = starPicker.querySelectorAll('.star-btn');
      starBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = Number(btn.dataset.rating) || 5;
          revRatingInput.value = val;
          starBtns.forEach((b) => {
            const bVal = Number(b.dataset.rating) || 5;
            b.classList.toggle('active', bVal <= val);
          });
        });
      });
    }

    // Submit form handler
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        reviewSubmitBtn.disabled = true;
        reviewStatus.className = 'review-form-status';
        reviewStatus.textContent = 'Transmitting feedback...';

        const name = document.getElementById('revName').value.trim();
        const role = document.getElementById('revRole').value.trim();
        const rating = revRatingInput ? revRatingInput.value : '5';
        const text = document.getElementById('revText').value.trim();

        const reviewPayload = {
          name,
          role,
          rating,
          text,
          date: new Date().toISOString().split('T')[0]
        };

        const markdownBody = `### New Review Submission\n\n` +
          `- **Author:** ${name}\n` +
          `- **Role / Context:** ${role}\n` +
          `- **Rating:** ${renderStars(rating)} (${rating}/5)\n\n` +
          `**Feedback:**\n> ${text}\n\n` +
          `\`\`\`json\n${JSON.stringify(reviewPayload, null, 2)}\n\`\`\``;

        let sentViaWeb3 = false;

        // 1. Try sending via Web3Forms if valid key configured
        if (WEB3FORMS_KEY && !WEB3FORMS_KEY.includes('YOUR_')) {
          try {
            const res = await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({
                access_key: WEB3FORMS_KEY,
                subject: `[Portfolio Review] from ${name} (${rating}★)`,
                from_name: name,
                rating: `${rating} / 5`,
                role,
                message: text
              })
            });
            if (res.ok) sentViaWeb3 = true;
          } catch (_) { }
        }

        reviewSubmitBtn.disabled = false;
        reviewForm.reset();
        if (revRatingInput) revRatingInput.value = '5';
        if (starPicker) {
          starPicker.querySelectorAll('.star-btn').forEach((b) => b.classList.add('active'));
        }

        // 2. Open GitHub Issue prefilled with title and formatted payload so it creates the issue directly in repo
        const issueUrl = `https://github.com/GNU-LuxTech/Personal-Portfolio-Website/issues/new?title=${encodeURIComponent(`[Review] from ${name}`)}&body=${encodeURIComponent(markdownBody)}`;

        reviewStatus.className = 'review-form-status is-ok';
        reviewStatus.innerHTML = sentViaWeb3
          ? `✓ Review sent to email! Opening GitHub to create issue record...`
          : `✓ Review formatted! Opening GitHub to create your issue record...`;

        setTimeout(() => {
          window.open(issueUrl, '_blank', 'noopener');
          closeModal();
        }, 1200);
      });
    }
  }

  /* ---- Interactive mini-shell ---- */
  const shellOut = document.getElementById('shellOut');
  const shellForm = document.getElementById('shellForm');
  const shellInput = document.getElementById('shellInput');

  if (shellOut && shellForm && shellInput) {
    const PROMPT = 'visitor@luxtech:~$';
    const SECTIONS = ['home', 'shell', 'about', 'skills', 'projects', 'reviews', 'contact'];
    const files = {
      'about.txt': 'about',
      'skills.txt': 'skills',
      'projects.txt': 'projects',
      'certs.txt': 'certs',
      'reviews.log': 'reviews',
      'contact.txt': 'contact'
    };
    const cmdHistory = [];
    let histPos = 0;

    const scrollDown = () => { shellOut.scrollTop = shellOut.scrollHeight; };

    const print = (text = '', cls = '') => {
      const div = document.createElement('div');
      div.className = 'shell-line' + (cls ? ' ' + cls : '');
      div.textContent = text;
      shellOut.appendChild(div);
      return div;
    };

    const printLink = (prefix, label, href) => {
      const div = print(prefix);
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
      div.appendChild(a);
    };

    const commands = {
      help() {
        print('Available commands:');
        [
          ['help', 'show this list'],
          ['whoami', 'who is behind this site'],
          ['about', 'a short bio'],
          ['skills', 'languages, tools, security'],
          ['projects', 'what I have built'],
          ['certs', 'certifications'],
          ['reviews', 'what people say'],
          ['contact', 'how to reach me'],
          ['github', 'open my GitHub profile'],
          ['ls', 'list files'],
          ['cat <file>', 'read a file'],
          ['goto <section>', 'jump to a section of the page'],
          ['echo <text>', 'print text'],
          ['date', 'current date and time'],
          ['history', 'previous commands'],
          ['clear', 'clear the screen (or Ctrl+L)']
        ].forEach(([c, d]) => print('  ' + c.padEnd(16) + d));
        print('Tip: Tab autocompletes, ↑/↓ browse history.', 'shell-dim');
      },
      whoami() {
        print('luxtech');
        print('visitor.', 'shell-dim');
      },
      about() {
        print('Mattia — online as LuxTech. 26 year old IT enthusiast who cares more about');
        print('how things work under the hood than about shipping the fastest possible demo.');
        print('Mostly Go, lots of Git, learning Docker, certified CompTIA Network+, working toward Security+, PenTest+.');
      },
      skills() {
        print('languages   Go, Python, JavaScript, Bash, PowerShell, Markdown, HTML, CSS, SQL');
        print('tools       Antigravity, Claude, Git, Docker (learning), Linux, Windows, GitHub');
        print('security    applied cryptography, Tor / onion services, TCP/IP, CompTIA Network+, Security+ (in progress), PenTest+ (in progress)');
      },
      projects() {
        print('Veil — privacy-focused, terminal-based encrypted P2P messaging app in Go.');
        print('       Tor onion services, Ed25519 / X25519, XChaCha20-Poly1305, Argon2id.');
        printLink('More: ', `github.com/${GH_ORG}`, `https://github.com/${GH_ORG}`);
      },
      certs() {
        if (!certs.length) return print('No certificates listed.', 'shell-dim');
        certs.forEach((c) => print(`- ${c.title} — ${c.issuer}, ${c.date}`));
        print('Open them in the Skills section.', 'shell-dim');
      },
      reviews() {
        if (!reviews.length) return print('No reviews logged yet.', 'shell-dim');
        reviews.forEach((r, i) => {
          const stars = renderStars(r.rating || 5);
          print(`[${i + 1}] ${stars} ${r.text}`);
          print(`    ${r.meta}`, 'shell-dim');
        });
      },
      contact() {
        const mail = document.querySelector('.contact-link[href^="mailto:"]');
        if (mail) printLink('email   ', mail.textContent.trim(), mail.getAttribute('href'));
        printLink('github  ', `github.com/${GH_ORG}`, `https://github.com/${GH_ORG}`);
      },
      github() {
        print('opening github ...', 'shell-dim');
        window.open(`https://github.com/${GH_ORG}`, '_blank', 'noopener');
      },
      ls() {
        print(Object.keys(files).join('  '));
      },
      cat([file]) {
        if (!file) return print('cat: missing file operand', 'shell-err');
        if (!Object.prototype.hasOwnProperty.call(files, file)) {
          return print(`cat: ${file}: No such file or directory`, 'shell-err');
        }
        commands[files[file]]();
      },
      goto([target]) {
        if (!target) return print('usage: goto <section>  (' + SECTIONS.join(', ') + ')', 'shell-err');
        const id = target.toLowerCase();
        const el = SECTIONS.includes(id) ? document.getElementById(id) : null;
        if (!el) return print(`goto: no such section: ${target}`, 'shell-err');
        print(`jumping to #${id} ...`, 'shell-dim');
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        shellInput.blur();
      },
      echo(args) { print(args.join(' ')); },
      date() { print(new Date().toString()); },
      history() {
        if (!cmdHistory.length) return print('(empty)', 'shell-dim');
        cmdHistory.forEach((c, i) => print(`${String(i + 1).padStart(3)}  ${c}`));
      },
      clear() { shellOut.innerHTML = ''; }
    };

    const run = (raw) => {
      const echoLine = print('', 'shell-cmd');
      const b = document.createElement('b');
      b.textContent = PROMPT;
      echoLine.append(b, ' ' + raw);

      const line = raw.trim();
      if (!line) return;
      cmdHistory.push(line);
      histPos = cmdHistory.length;

      const [name, ...args] = line.split(/\s+/);
      const key = name.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(commands, key)) {
        commands[key](args);
      } else {
        print(`${name}: command not found. Type 'help' for available commands.`, 'shell-err');
      }
    };

    shellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = shellInput.value;
      shellInput.value = '';
      run(value);
      scrollDown();
    });

    shellInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!cmdHistory.length) return;
        histPos = e.key === 'ArrowUp' ? Math.max(0, histPos - 1) : Math.min(cmdHistory.length, histPos + 1);
        shellInput.value = cmdHistory[histPos] || '';
        requestAnimationFrame(() => shellInput.setSelectionRange(shellInput.value.length, shellInput.value.length));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const parts = shellInput.value.split(' ');
        let pool = Object.keys(commands);
        if (parts.length > 1) {
          pool = parts[0] === 'goto' ? SECTIONS : parts[0] === 'cat' ? Object.keys(files) : [];
        }
        const frag = parts[parts.length - 1].toLowerCase();
        const matches = pool.filter((x) => x.startsWith(frag));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          shellInput.value = parts.join(' ') + (parts.length === 1 ? ' ' : '');
        } else if (matches.length > 1) {
          print(matches.join('  '), 'shell-dim');
          scrollDown();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        commands.clear();
      }
    });

    shellOut.addEventListener('click', () => {
      if (!window.getSelection().toString()) shellInput.focus({ preventScroll: true });
    });

    print("luxtech shell v1.0 — type 'help' to get started.", 'shell-ok');
    print('');
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
