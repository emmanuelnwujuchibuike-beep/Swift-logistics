




          function switchPayment(method, info) {
                  // Make sure this ID exists inside your newly injected HTML
          const display = document.getElementById('payment-detail-display');

          if (!display) {
          console.error("Could not find payment-detail-display. Check your HTML!");
          return;
                  }

                  // GSAP animate the display container out
          gsap.to(display, { opacity: 0, y: 10, duration: 0.3, onComplete: () => {
                  // Update the content based on the method
          if (method === 'BTC') {
                      display.innerHTML = `<p class="text-blue-400 font-bold mb-1">BITCOIN WALLET</p><span class="break-all font-mono">${info}</span>`;
          } else if (method === 'USDT') {
                      display.innerHTML = `<p class="text-green-400 font-bold mb-1">USDT ADDRESS</p><span class="break-all font-mono">${info}</span>`;
          } else {
                      // Re-format the WIRE string if it contains commas
          const formattedWire = info.replace(/Bank: |Name: |Account: /g, '<br>$&');
          display.innerHTML = `<p class="text-slate-300 font-bold mb-1">LOCAL BANK</p><span class="text-sm">${formattedWire}</span>`;
                  }
                  
                  // GSAP animate it back in
          gsap.to(display, { opacity: 1, y: 0, duration: 0.3 });
              }});
          }


          


          // 2. MAIN TRACKING ENGINE
                            async function handleTracking() {
             const trackingInput = document.getElementById('trackingInput');
                  const dashboard = document.getElementById('dashboard-target');
                  const searchGate = document.getElementById('search-gate');
                  const searchBtn = document.getElementById('search-btn');
                  const errorMsg = document.getElementById('error-msg');

                  if (!trackingInput || !dashboard || !searchGate || !searchBtn || !errorMsg) return;

                  const trackingNo = trackingInput.value.trim();

                  const showError = (message) => {
                      errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${message}`;
                      errorMsg.classList.remove('hidden');
                  };

                  const hideError = () => {
                      errorMsg.textContent = '';
                      errorMsg.classList.add('hidden');
                  };

                  if (!trackingNo) {
                      dashboard.innerHTML = '';
                      showError('Please enter your shipment tracking code.');
                      return;
                  }

                  searchBtn.disabled = true;
                  searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Searching...';
                  hideError();

                  const spaceId = 'i55d4qvuj8ah';
                  const accessToken = 'e4BFBJQiuGHI2ZIrKdxgmaUXNCmRUi46jSwQjbw0pUg';
                  const url = `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&content_type=shipment&fields.trackingId=${trackingNo}`;

                  try {
                      const response = await fetch(url);
                      const resData = await response.json();

                      if (!resData.items || resData.items.length === 0) {
                          dashboard.innerHTML = '';
                          searchGate.style.display = 'block';
                          showError('No shipment found for that ID. Please verify and try again.');
                          return;
                      }

                      const shipment = resData.items[0].fields;
                      const isPaid = shipment.paymentStatus?.toLowerCase() === 'confirmed';
                      searchGate.style.display = 'none';

                      dashboard.innerHTML = `
                          <div class="dashboard-panel max-w-3xl mx-auto overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/85 shadow-[0_45px_120px_rgba(15,23,42,0.55)] backdrop-blur-3xl text-slate-100">
                              <div class="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-cyan-950/95 px-8 py-8">
                                  <div class="pointer-events-none absolute -left-24 top-8 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"></div>
                                  <div class="pointer-events-none absolute -right-28 bottom-12 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"></div>
                                  <button onclick="location.reload()" class="premium-top-btn absolute right-8 top-8 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-sm transition duration-300 hover:scale-[1.03] hover:border-cyan-300/40 hover:bg-cyan-500/20">
                                      <i class="fas fa-arrow-left"></i>
                                      Return
                                  </button>
                                  <div class="header-anim relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                      <div>
                                          <p class="text-cyan-300 font-mono text-[10px] tracking-[0.45em] uppercase mb-2">Elite Shipment Profile</p>
                                          <h2 class="text-4xl font-black uppercase tracking-tight text-white">${trackingNo}</h2>
                                          <p class="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">${shipment.serviceType || 'Premium Delivery'}</p>
                                      </div>
                                      <button onclick="location.reload()" class="track-again-btn inline-flex items-center justify-center gap-3 rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_20px_80px_rgba(14,165,233,0.20)] transition duration-300 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-cyan-500/15">
                                          <i class="fas fa-arrow-left text-base"></i>
                                          Back to Search
                                      </button>
                                  </div>
                              </div>

                              <div class="grid gap-6 lg:grid-cols-[1.25fr_0.9fr] p-8">
                                  <div class="space-y-6">
                                      <div class="panel-card rounded-[2.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl">
                                          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                              <div>
                                                  <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Current Status</p>
                                                  <h3 class="mt-2 text-3xl font-extrabold text-white">${shipment.status || 'In Transit'}</h3>
                                              </div>
                                              <span class="rounded-full bg-green-500 flex px-4 animate-pulse items-center gap-2 text-nowrap py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100"> <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#FDF3D0"><path d="M195-195q-35-35-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35q-50 0-85-35Zm442-245h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z" class="animated-bounce"/></svg>${shipment.priority || 'Priority'}</span>
                                          </div>
                                          <p class="mt-4 text-sm leading-relaxed text-slate-300">Latest location: <span class="font-semibold text-white">${shipment.currentLocation || 'Unknown location'}</span></p>
                                      </div>

                                        <div id="fluid-line" class="absolute left-[19px] top-4 bottom-10 w-[4px] bg-gradient-to-b from-green-600 via-green-400 to-transparent origin-top scale-y-0 animate-pulse"></div>

                                      <div class="space-y-4">
                                          ${renderEliteStep(shipment.status, shipment.currentLocation, 'Picked Up', 'fa-box', true, shipment.transit1textcolor)}
                                          ${renderEliteStep(shipment.TrasitStep3Name, shipment.TrasitStep3Location, 'Loaded', 'fa-truck', !!shipment.TrasitStep3Name, shipment.transit3textcolor)}
                                          ${renderEliteStep(shipment.Transitstep2Name, shipment.Transitstep2Location, 'Transit', 'fa-plane', !!shipment.transitStep2Name, shipment.transit2textcolor)}
                                          ${renderEliteStep(shipment.TransitStep1Name, shipment.TransitStep1Location, 'Arrival', 'fa-box-open', !!shipment.TransitStep1Name, shipment.transit2textcolor)}
                                      </div>

                                      
                                  </div>

                                  <div class="space-y-6">
                                      <div class="panel-card rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.20)] backdrop-blur-xl">
                                          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Shipment Summary</p>
                                          <ul class="space-y-3 text-sm text-slate-300">
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Name</span><span>${shipment.name || shipment.shipmentName || shipment.customerName || 'N/A'}</span></li>
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Destination</span><span>${shipment.destination || 'TBD'}</span></li>
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Sender's Name</span><span>${shipment.sendersname || 'TBD'}</span></li>
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Pickup Date</span><span>${shipment.pickupDate || 'Pending'}</span></li>
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Delivery ETA</span><span>${shipment.eta || 'TBD'}</span></li>
                                              <li class="flex justify-between gap-3"><span class="font-semibold text-white">Weight</span><span>${shipment.packageDetails || 'N/A'}</span></li>
                                          </ul>
                                      </div>
                                      ${isPaid ? `
                                          <div class="panel-card rounded-[2.5rem] border border-emerald-400/15 bg-emerald-500/10 p-6 shadow-[0_20px_90px_rgba(16,185,129,0.15)] backdrop-blur-xl">
                                              <div class="flex items-center justify-between mb-4">
                                                  <div>
                                                      <p class="text-xs uppercase tracking-[0.4em] text-emerald-200">Shipment Status</p>
                                                      <h3 class="mt-2 text-3xl font-extrabold text-white">Package Secured</h3>
                                                  </div>
                                                  <span class="rounded-full bg-emerald-500/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">${shipment.paymentStatus}</span>
                                              </div>
                                              <p class="text-sm leading-relaxed text-slate-200">Your delivery is cleared and proceeding on schedule.</p>
                                          </div>
                                      ` : ''}
                                      <div class="panel-card payment-anim rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_20px_80px_rgba(14,165,233,0.14)] backdrop-blur-xl">
                                          <div class="flex items-center justify-between mb-4">
                                              <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Payment</p>
                                              ${isPaid ? `
                                              <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">Comfirmed</span>
                                              ` : `
                                              <span class="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">Pending</span>
                                              `}
                                          </div>
                                          
                                            

                                          <p class="mt-3 text-sm text-slate-400">${isPaid ? 'Payment confirmed for this shipment.' : 'Payment is pending. Select a secure option below.'}</p>

                                          ${isPaid ? '' : `
                                            <div class="flex justify-between items-center mb-6">
                                                <p class="text-green-800 font-semibold text-[18px] uppercase tracking-widest">Service Invoice</p>
                                                <span class="text-white font-mono text-3xl font-bold">${shipment.amountDue || '$0.00'}</span>
                                            </div>
                                              <div class="mt-6 grid gap-3">
                                                  <button onclick="switchPayment('BTC', '${shipment.btcAddress}')" class="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-white/20">BTC</button>
                                                  <button onclick="switchPayment('USDT', '${shipment.usdtAddress}')" class="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-white/20">USDT</button>
                                                  <button onclick="switchPayment('WIRE', 'Bank: ${shipment.bankName || 'N/A'}, Name: ${shipment.accountName || 'N/A'}, Account: ${shipment.bankNumber || 'N/A'}')" class="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-white/20">WIRE</button>
                                              </div>
                                              <div id="payment-detail-display" class="mt-5 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-slate-300 text-sm font-mono min-h-[72px]">Select a payment method to see the secure details.</div>
                                          `}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      `;

                      const resultTimeline = gsap.timeline();
                      resultTimeline.from('.dashboard-panel', { autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out' });
                      resultTimeline.from('.header-anim', { opacity: 0, y: -20, duration: 0.8, ease: 'power4.out' }, '-=0.7');
                      resultTimeline.from('.dashboard-panel .panel-card:not(.payment-anim)', { opacity: 0, y: 20, stagger: 0.12, duration: 0.7, ease: 'back.out(1.3)' }, '-=0.6');
                      resultTimeline.from('.step-item', { opacity: 0, x: -20, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.5');
                      resultTimeline.from('.icon-anim', { scale: 0, rotation: -180, stagger: 0.12, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.6');
                      resultTimeline.from('.payment-anim', { opacity: 0, y: 30, duration: 0.7, ease: 'back.out(1.3)' }, '-=0.4');
                      resultTimeline.from('.track-again-btn, .dashboard-panel button[onclick="location.reload()"]', { opacity: 0, y: 10, duration: 0.6, ease: 'power2.out' }, '-=0.3');
                  } catch (e) {
                      console.error('Elite Tracking System Error:', e);
                      dashboard.innerHTML = '';
                      searchGate.style.display = 'block';
                      showError('Unable to load tracking details. Please try again in a moment.');
                  } finally {
                      searchBtn.disabled = false;
                      searchBtn.innerHTML = '<i class="fab fa-searchengin text-xl"></i> Find Shipment';
                  }
              }

          function renderEliteStep(name, loc, label, icon, active, color) {
          if (!name) return "";

          // If no color is provided in Contentful, default to blue
          const colorClass = color || "text-blue-500"; 
          // We replace 'text-' with 'bg-' for the icon background if needed
          const bgClass = colorClass.replace("text-", "bg-").replace("-500", "-950");

          return `
          <div class="step-item relative pl-14 group">
              <div class="absolute left-0 top-1 w-10 h-10 rounded-2xl ${bgClass} border border-white/10 flex items-center justify-center ${colorClass} icon-anim">
                  <i class="fas ${icon} text-xs animate-bounce"></i>
              </div>
              
              <div class="bg-white/5 p-5 rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl transition duration-300 hover:-translate-y-1">
                  <div class="flex justify-between items-center w-full">
                      <h4 class="font-bold font-mono text-xs uppercase tracking-[0.25em] text-slate-300">${name}</h4>
                      <span class="font-mono text-[12px] font-bold uppercase text-slate-500 ml-4">${label}</span>
                  </div>
                  <p class="text-slate-100 text-[14px] mt-3 font-mono">${loc}</p>
              </div>
          </div>`;
    }

    function initializeRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal-init, .reveal-from-left, .reveal-from-right, .reveal-from-bottom');
        if (revealElements.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -120px 0px',
            threshold: 0.15,
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                element.classList.add('reveal-active');
                observer.unobserve(element);
            });
        }, observerOptions);

        revealElements.forEach(element => {
            const delayValue = element.dataset.revealDelay;
            if (delayValue) {
                const delay = delayValue.toString().trim();
                element.style.transitionDelay = delay.endsWith('s') ? delay : `${delay}s`;
            }
            revealObserver.observe(element);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const menuBtn = document.getElementById('menu-btn');
        const sideMenu = document.getElementById('side-menu');

        if (!menuBtn || !sideMenu) return;

        const refreshMenuState = () => {
            const isOpen = !sideMenu.classList.contains('translate-x-full');
            sideMenu.classList.toggle('menu-open', isOpen);
        };

        menuBtn.addEventListener('click', () => {
            requestAnimationFrame(refreshMenuState);
        });

        refreshMenuState();
    });
    


    
    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        const topLinks = Array.from(body.querySelectorAll('a[href="#Top"]'));
        topLinks.forEach(link => {
            if (link.textContent.trim().toLowerCase().includes('back to top')) {
                const parent = link.closest('div, section, footer');
                if (parent) parent.style.display = 'none';
            }
        });

        const premiumBtn = document.createElement('button');
        premiumBtn.id = 'premium-back-to-top';
        premiumBtn.type = 'button';
        premiumBtn.className = 'premium-back-to-top';
        premiumBtn.innerHTML = '<span class="back-to-top-icon animate-">↑</span><span class="back-to-top-text"></span>';
        premiumBtn.style.display = 'none';
        premiumBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        body.appendChild(premiumBtn);

        // Choose the second top-level section if available, otherwise the second top-level div
        let triggerElement = null;
        try {
            const sections = Array.from(document.querySelectorAll('section'));
            const divs = Array.from(document.querySelectorAll('div'));
            if (sections.length > 1) triggerElement = sections[1];
            else if (divs.length > 1) triggerElement = divs[1];
            else triggerElement = document.querySelector('section, div');
        } catch (err) {
            console.warn('Trigger selection fallback', err);
            triggerElement = document.querySelector('section, div');
        }

        if (!triggerElement) {
            console.debug('Premium back-to-top: no trigger element found, showing button by default');
            premiumBtn.style.display = 'flex';
            return;
        }

        const updateThreshold = () => triggerElement.getBoundingClientRect().bottom + window.scrollY;
        let threshold = updateThreshold();

        const updateButton = () => {
            threshold = updateThreshold();
            const show = window.scrollY > threshold;
            premiumBtn.style.display = show ? 'flex' : 'none';
            // debug logs
            if (Math.abs(window.scrollY - threshold) < 50) {
                console.debug('premium-back-to-top: scrollY', window.scrollY, 'threshold', threshold, 'show', show);
            }
        };

        window.addEventListener('scroll', updateButton, { passive: true });
        window.addEventListener('resize', updateButton);
        // run once after small delay so layout settles
        setTimeout(updateButton, 120);
    });


    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        const hideLoaderAndStartReveals = () => {
            if (loader) {
                loader.classList.add('hidden');
            }
            initializeRevealAnimations();
        };

        if (loader) {
            setTimeout(hideLoaderAndStartReveals, 1600);
        } else {
            initializeRevealAnimations();
        }
    });