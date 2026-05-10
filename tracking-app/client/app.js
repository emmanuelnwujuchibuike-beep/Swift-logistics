async function trackPackage() {

  const code = document
    .getElementById("trackingInput")
    .value
    .toUpperCase();

  const resultDiv = document.getElementById("result");

  const res = await fetch(
    `http://localhost:3000/track/${code}`
  );

  const data = await res.json();

  if (data.success) {

    resultDiv.innerHTML = `
      <div class="bg-gray-100 p-4 rounded-lg">

        <p><strong>Status:</strong> ${data.data.status}</p>

        <p><strong>Location:</strong> ${data.data.location}</p>

        <p><strong>Date:</strong> ${data.data.date}</p>

      </div>
    `;

  } else {

    resultDiv.innerHTML = `
      <p class="text-red-500">
        Tracking code not found
      </p>
    `;
  }
}