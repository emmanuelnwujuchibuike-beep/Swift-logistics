






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

              if (!trackingInput.value) return;
              const trackingNo = trackingInput.value.trim();

              const spaceId = 'i55d4qvuj8ah';
              const accessToken = 'e4BFBJQiuGHI2ZIrKdxgmaUXNCmRUi46jSwQjbw0pUg';
              const url = `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&content_type=shipment&fields.trackingId=${trackingNo}`;

              try {
              const response = await fetch(url);
              const resData = await response.json();


              
              
              if (resData.items && resData.items.length > 0) {
              const shipment = resData.items[0].fields;
              searchGate.style.display = "none";


        
              

                      // CHECK PAYMENT STATUS (Case-Insensitive)
              const isPaid = shipment.paymentStatus?.toLowerCase() === "confirmed";

              dashboard.innerHTML = `

              
                <div class="max-w-md mx-auto p-6 border-x sm:borde rounded-[2.5rem] border border-slate-100 bg-white/5 backdrop-blur-2xl border-white/10 w-full shadow-2xl min-h-screen relative overflow-hidden">
                              
                    <div class="header-anim flex justify-between items-start mb-12">
                      <div>
                        <p class="text-blue-500 font-mono text-[9px] tracking-[0.4em] uppercase mb-1">Secured Tracking</p>
                        <h2 class="text-blue-950 text-4xl font-black italic tracking-tighter uppercase">${trackingNo}</h2>
                      </div>
                          <button onclick="location.reload()" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10 hover:border-blue-500 transition-all">
                            <i class="fas fa-times"></i>
                          </button>
                    </div>

                    <div class="relative">
                          <div id="fluid-line" class="absolute left-[19px] top-4 bottom-10 w-[4px] bg-gradient-to-b from-green-600 via-green-400 to-transparent origin-top scale-y-0 animate-pulse"></div>
                                          
                            <div class="space-y-6">
                              ${renderEliteStep(shipment.status, shipment.currentLocation, "Picked Up", "fa-box", true ,shipment.transit1textcolor)}
                              ${renderEliteStep(shipment.TrasitStep3Name, shipment.TrasitStep3Location, "Loaded", "fa-truck",  !!shipment.TrasitStep3Name ,shipment.transit3textcolor)}
                              ${renderEliteStep(shipment.Transitstep2Name, shipment.Transitstep2Location, "Transit", "fa-plane", !!shipment.transitStep2Name ,shipment.transit2textcolor)}
                              ${renderEliteStep(shipment.TransitStep1Name, shipment.TransitStep1Location, "Arrival", "fa-box-open", !!shipment.transitStep1Name ,shipment.transit2textcolor)}
                            </div>
                          </div>

                          <div class="payment-anim mt-12">
                            ${isPaid ? `
                            <div class="bg-green-500/10 border border-green-500/20 p-8 rounded-[2.5rem] flex items-center gap-5">
                            <div class="success-icon w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <i class="fas fa-check text-white text-xl"></i>
                          </div>

                          <div>
                            <h3 class="text-white font-bold uppercase text-[11px] tracking-widest">Package Secured</h3>
                            <p class="text-green-500/60 text-[9px] mt-1 font-mono uppercase italic">Package Security Cleared</p>
                          </div>
                        </div>
                                      ` : `
                        <div class="bg-blue-600/5 border-2 border-blue-600/30 p-8 rounded-[3rem] backdrop-blur-xl">
                          <div class="flex justify-between items-center mb-6">
                            <p class="text-blue-950 font-semibold text-[14px] uppercase tracking-widest italic">Service Invoice</p>
                            <span class="text-white font-mono text-3xl font-bold">${shipment.amountDue || '$0.00'}</span>
                          </div>
                            <div id="payment-detail-display" class="bg-black/60 p-5 rounded-2xl text-slate-400 text-[15px] font-mono mb-6 border border-white/5 min-h-[60px]">
                               <p class="text-green-500 font-semibold">Select Method</p>
                            </div>
                
                            <div id="payment-anim" class="flex gap-2 mt-4">
                                <button onclick="switchPayment('BTC', '${shipment.btcAddress}')" class="flex-1 bg-white/10 p-2">BTC</button>
                                <button onclick="switchPayment('USDT', '${shipment.usdtAddress}')" class="flex-1 bg-white/10 p-2">USDT</button>
                                <button onclick="switchPayment('WIRE', 'Bank: ${shipment.bankName || 'N/A'}, Name: ${shipment.accountName || 'N/A'}, Account: ${shipment.bankNumber || 'N/A'}')" class="flex-1 bg-white/10 p-2">WIRE</button>
                            </div>

                          `}
                    </div>
                </div>
                      `;

                      
                gsap.from(".header-anim", { opacity: 4, y: -20, duration: 1, ease: "power4.out" });
                      
                    
                gsap.to("#fluid-line", { scaleY: 1, duration: 3, ease: "power2.inOut", delay: 0.5 });

                  
                gsap.from(".step-item", { opacity: 0, x: -20, stagger: 0.2, duration: 1, ease: "power3.out", delay: 0.8 });
                gsap.from(".icon-anim", { 
                scale: 0, 
                rotation: -180, 
                stagger: 0.2, 
                duration: 1, 
                ease: "back.out(1.7)", 
                delay: 0.9 
                });


                


                      // 3. Animate the payment box
                gsap.from(".payment-anim", { opacity: 0, y: 50, duration: 1.2, ease: "expo.out", delay: 1.2 });
                gsap.from(".success-icon", { scale: 0, rotation: 360, duration: 1, ease: "back.out(2)", delay: 1.5 });

                } else {
                alert("Record not found in database.");
                }
                } catch (e) { console.error("Elite Tracking System Error:", e); }
              }


              
             
          function renderEliteStep(name, loc, label, icon, active, color) {
          if (!name) return "";

          // If no color is provided in Contentful, default to blue
          const colorClass = color || "text-blue-500"; 
          // We replace 'text-' with 'bg-' for the icon background if needed
          const bgClass = colorClass.replace("text-", "bg-").replace("-500", "-950");

          return `
          <div class="step-item relative pl-14 group">
              <div class="absolute left-0 top-1 w-10 h-10 rounded-2xl ${bgClass} border border-white/10 flex items-center justify-center ${colorClass}">
                  <i class="fas ${icon} text-xs animate-bounce animate-pulse "></i>
              </div>
              
              <div class="bg-white/0.05 p-5 rounded-[2rem] border border-white/5 shadow-lg backdrop-blur-sm">
                  <div class="flex justify-between items-center w-full">
                      <h4 class=" font-bold text-xs uppercase ">${name}</h4>
                      <span class="font-mono text-[12px] font-bold uppercase  text-slate-700 text- ml-4">${label}</span>
                  </div>
                  <p class="text-white text-[14px] mt-2 fontmono">${loc}</p>
              </div>
          </div>`;
    }

    document.addEventListener('DOMContentLoaded', () => {
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
    });


    
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