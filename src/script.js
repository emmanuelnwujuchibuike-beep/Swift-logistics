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

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));