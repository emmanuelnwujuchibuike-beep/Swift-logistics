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

// Put this in your frontend script.js
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (id) {
    console.log("User is tracking ID:", id);
    // Use this ID to show the "Progress Bar" we built earlier!
}


