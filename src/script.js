

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });



const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

gsap.to(".reveal-image", {
    yPercent: -20, 
    ease: "none",
    scrollTrigger: {
        trigger: ".reveal-container",
        start: "top bottom", 
        end: "bottom top",  
        scrub: 2,  
    }
});

gsap.from(".reveal-text", {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    scrollTrigger: {
        trigger: ".reveal-text",
        start: "top 90%",
    }
});


gsap.registerPlugin(ScrollTrigger);


const revealElements = document.querySelectorAll(".premium-reveal");

                revealElements.forEach((el) => {
                gsap.fromTo(el, 
                                { 
                opacity: 0, 
                y: 100,             
                scale: 0.95,       
                filter: "blur(5px)"
                }, 
                {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 1.2,     
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", 
                    toggleActions: "play none none reverse", 
                }
                }
            );
            });

        window.addEventListener("load", () => {
            const tl = gsap.timeline();

            tl.to(".premium-reveal", {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 1.2,
                ease: "power4.out",
                stagger: 0.3,
    });
});






    document.getElementById("quote-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // This stops the "White Screen" refresh

  const form = e.target;
  const formData = new FormData(form);

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });
    
    // Replace the button text to show success
    const btn = form.querySelector('button');
    btn.innerHTML = "Quote Sent Successfully!";
    btn.style.backgroundColor = "#10b981"; // Changes to Green
    form.reset(); // Clears the boxes
    
  } catch (error) {
    alert("Submission failed. Please check your internet.");
  }
});


/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      // You can define colors here to use in your shadows later
      colors: {
        'brand-blue': '#001b3d', // Your Blue-950
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.10)',
        },
        '.text-shadow-md': {
          textShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
        '.text-shadow-lg': {
          textShadow: '0 10px 20px rgba(0,0,0,0.25)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    }),
  ],
}



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

              
                <div class="w-full max-w-md mx-auto p-6 border-x sm:borde rounded-[2.5rem] border border-slate-100 bg-white/5 backdrop-blur-2xl border-white/10 w-full shadow-2xl min-h-screen relative overflow-hidden">
                              
                    <div class="header-anim flex justify-between items-start mb-12">
                      <div>
                        <p class="text-blue-500 font-mono text-[9px] tracking-[0.4em] uppercase mb-1">Secured Tracking</p>
                        <h2 class="text-white text-4xl font-black italic tracking-tighter uppercase">${trackingNo}</h2>
                      </div>
                          <button onclick="location.reload()" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10 hover:border-blue-500 transition-all">
                            <i class="fas fa-times"></i>
                          </button>
                    </div>

                    <div class="relative">
                          <div id="fluid-line" class="absolute left-[19px] top-4 bottom-10 w-[2px] bg-gradient-to-b from-green-600 via-green-400 to-transparent origin-top scale-y-0"></div>
                                          
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
                            <h3 class="text-white font-bold uppercase text-[11px] tracking-widest">Payment Confirmed</h3>
                            <p class="text-green-500/60 text-[9px] mt-1 font-mono uppercase italic">Package Security Cleared</p>
                          </div>
                        </div>
                                      ` : `
                        <div class="bg-blue-600/5 border-2 border-blue-600/30 p-8 rounded-[3rem] backdrop-blur-xl">
                          <div class="flex justify-between items-center mb-6">
                            <p class="text-blue-500 font-black text-[10px] uppercase tracking-widest italic">Service Dues</p>
                            <span class="text-white font-mono text-3xl font-bold">${shipment.amountDue || '$0.00'}</span>
                          </div>
                            <div id="payment-detail-display" class="bg-black/60 p-5 rounded-2xl text-slate-400 text-[11px] font-mono mb-6 border border-white/5 min-h-[60px]">
                                BANK: SWIFT INTL BANK <br> NAME: EMMANUEL CHRIS LOGISTICS
                            </div>
                
                            <div class="flex gap-2 mt-4">
                                <button onclick="switchPayment('BTC', '${shipment.btcAddress}')" class="flex-1 bg-white/10 p-2">BTC</button>
                                <button onclick="switchPayment('USDT', '${shipment.usdtAddress}')" class="flex-1 bg-white/10 p-2">USDT</button>
                                <button onclick="switchPayment('WIRE', 'Bank: ${shipment.bankName || 'N/A'}, Name: ${shipment.accountName || 'N/A'}, Account: ${shipment.bankNumber || 'N/A'}')" class="flex-1 bg-white/10 p-2">WIRE</button>
                            </div>

                          `}
                    </div>
                </div>
                      `;

                      // TRIGGER GSAP MASTER ANIMATIONS
                gsap.from(".header-anim", { opacity: 0, y: -20, duration: 1, ease: "power4.out" });
                      
                      // 1. Animate the fluid line first
                gsap.to("#fluid-line", { scaleY: 1, duration: 2, ease: "power2.inOut", delay: 0.5 });

                      // 2. Animate the step items and their icons
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
        <i class="fas ${icon} text-xs animate-pulse"></i>
    </div>
    
    <div class="bg-white/0.05 p-5 rounded-[2rem] border border-white/5 shadow-lg backdrop-blur-sm">
        <div class="flex justify-between items-center w-full">
            <h4 class=" font-bold text-xs uppercase ">${name}</h4>
            <span class="font-mono text-[12px] font-bold uppercase text- ml-4">${label}</span>
        </div>
        <p class="text-white text-[14px] mt-2 fontmono">${loc}</p>
    </div>
</div>`;
}