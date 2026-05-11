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

// document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// import Lenis from 'lenis';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// // 1. Register ScrollTrigger
// gsap.registerPlugin(ScrollTrigger);

// // 2. Initialize Lenis
// const lenis = new Lenis({
//   duration: 1.2,
//   easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium easing
//   smoothWheel: true,
// });

// // 3. Sync Lenis with GSAP ScrollTrigger
// lenis.on('scroll', ScrollTrigger.update);

// gsap.ticker.add((time) => {
//   lenis.raf(time * 1000); // Convert time to milliseconds
// });

// gsap.ticker.lagSmoothing(0);

// gsap.to(".reveal-selection", {
//   yPercent: 30, // Moves the image slightly slower than the scroll
//   ease: "none",
//   scrollTrigger: {
//     trigger: ".reveal",
//     start: "top bottom", // Starts when top of container hits bottom of viewport
//     end: "bottom top",
//     scrub: true,         // Smoothly follows the scrollbar
//   },
// });

// 1. Setup Lenis (The Smooth Scroll Engine)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
});

// 2. Sync Lenis with GSAP ScrollTrigger
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
    duration: 1.5,
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