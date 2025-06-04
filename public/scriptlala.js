document.getElementById('matchForm').addEventListener('submit', function (e) {
  e.preventDefault(); // voorkom herladen van pagina

  // Verzamel alle geselecteerde antwoorden
  const formData = new FormData(this);
  const selectedTags = [];

  for (const [name, value] of formData.entries()) {
    selectedTags.push(value.toLowerCase()); // alles lowercase voor consistente vergelijking
  }

  // Haal alle evenementen op
  fetch('/events')
    .then(res => res.json())
    .then(events => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';

      // Filter alleen evenementen die matchen met minimaal één tag
      const matchingEvents = events.filter(event =>
        event.tags.some(tag => selectedTags.includes(tag.toLowerCase()))
      );

      if (matchingEvents.length === 0) {
        resultsDiv.innerHTML = '<p>Geen evenementen gevonden die passen bij je voorkeuren.</p>';
      } else {
        matchingEvents.forEach(event => {
          const div = document.createElement('div');
          div.innerHTML = `<h3>${event.name}</h3><p><strong>Tags:</strong> ${event.tags.join(', ')}</p>`;
          resultsDiv.appendChild(div);
        });
      }
    })
    .catch(err => {
      console.error('Fout bij ophalen evenementen:', err);
    });
});

