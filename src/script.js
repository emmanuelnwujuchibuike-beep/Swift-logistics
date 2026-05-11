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

// 3. The Professional Reveal Animation
// This creates the parallax effect where the image moves slower than the scroll
gsap.to(".reveal-image", {
    yPercent: -20, // Moves up inside the container
    ease: "none",
    scrollTrigger: {
        trigger: ".reveal-container",
        start: "top bottom", // Animation starts when container top hits screen bottom
        end: "bottom top",    // Ends when container bottom hits screen top
        scrub: 2,          // Links animation directly to scrollbar
    }
});

// Text Reveal Animation
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

// Ensure GSAP and ScrollTrigger are ready
gsap.registerPlugin(ScrollTrigger);

// Target all elements with the class
const revealElements = document.querySelectorAll(".premium-reveal");

revealElements.forEach((el) => {
  gsap.fromTo(el, 
    { 
      opacity: 0, 
      y: 100,             // Start 100px lower
      scale: 0.95,        // Start slightly smaller
      filter: "blur(10px)" // Add a premium blur
    }, 
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.2,      // Take 1.2 seconds to reveal
      ease: "power4.out", // This is the "luxury" easing curve
      scrollTrigger: {
        trigger: el,
        start: "top 85%", // Starts when the top of the div hits 85% of viewport height
        toggleActions: "play none none reverse", // Plays on scroll down, reverses on scroll up
      }
    }
  );
});

window.addEventListener("load", () => {
    // Create a timeline for the page entrance
    const tl = gsap.timeline();

    tl.to(".premium-reveal", {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.2, // This makes elements fade in one after another (very premium!)
    });
});