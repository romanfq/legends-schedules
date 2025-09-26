// Helper: toggle match fields based on status
document.querySelectorAll('.status-select').forEach(select => {
    const matchFields = select.closest('fieldset').querySelector('.match-fields');
  
    function toggleFields() {
      if (select.value !== 'scheduled') {
        matchFields.style.display = 'none';
        matchFields.querySelectorAll('input').forEach(i => i.value = '');
      } else {
        matchFields.style.display = 'block';
      }
      renderPreview();
    }
  
    select.addEventListener('change', toggleFields);
    toggleFields(); // initial check
  });
  
  // Build match object
  function buildMatch(form, prefix, league) {
    const status = form[prefix + '_status'].value;
    if (status !== 'scheduled') {
      return {
        league,
        date: form[prefix + '_date'].value,
        status,
        meeting_time: '',
        kickoff_time: '',
        home_team: '',
        away_team: '',
        venue: { name: '', address: '', maps_link: '', maps_embed: '' }
      };
    }
  
    let kickoff = form[prefix + '_kickoff_time'].value;
    const meeting = form[prefix + '_meeting_time'].value;
    if (!kickoff && meeting) {
      const [h, m] = meeting.split(':').map(Number);
      const date = new Date();
      date.setHours(h + 1, m);
      kickoff = date.toTimeString().slice(0,5);
    }
  
    return {
      league,
      date: form[prefix + '_date'].value,
      status,
      meeting_time: meeting,
      kickoff_time: kickoff,
      home_team: form[prefix + '_home_team'].value,
      away_team: form[prefix + '_away_team'].value,
      venue: {
        name: form[prefix + '_venue_name'].value,
        address: form[prefix + '_venue_address'].value,
        maps_link: form[prefix + '_maps_link'].value,
        maps_embed: form[prefix + '_maps_embed'].value
      }
    };
  }
  
  // Render preview
  function renderPreview() {
    const form = document.getElementById('match-form');
    const preview = document.getElementById('preview-container');
    preview.innerHTML = ''; // clear previous preview
  
    ['sat','sun'].forEach((prefix, i) => {
      const league = i === 0 ? 'JPL' : 'Selkent';
      const match = buildMatch(form, prefix, league);
  
      const card = document.createElement('div');
      card.className = 'match-card';
  
      const header = document.createElement('div');
      header.className = 'match-header';
      header.innerHTML = `<span class="league">${match.league}</span>
                          <span class="date">${match.date}</span>`;
      card.appendChild(header);
  
      if (match.status !== 'scheduled') {
        const statusEl = document.createElement('p');
        statusEl.className = `status-${match.status}`;
        statusEl.textContent = match.status.toUpperCase();
        card.appendChild(statusEl);
      } else {
        card.innerHTML += `
          <p><strong>Meeting:</strong> ${match.meeting_time}</p>
          <p><strong>Kickoff:</strong> ${match.kickoff_time}</p>
          <p class="teams">${match.home_team} vs ${match.away_team}</p>
          <div class="venue">
            <strong>Venue:</strong> ${match.venue.name}<br/>
            ${match.venue.address}<br/>
            <a href="${match.venue.maps_link}" target="_blank">Open in Google Maps</a>
          </div>
          ${match.venue.maps_embed ? `
          <div class="map-container">
            <iframe src="${match.venue.maps_embed}" allowfullscreen="" loading="lazy"></iframe>
          </div>` : ''}
        `;
      }
  
      preview.appendChild(card);
    });
  }
  
  // Form submission: generate JSON
  document.getElementById('match-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const weekendJSON = {
      weekend: form['sat_date'].value,
      matches: [buildMatch(form,'sat','JPL'), buildMatch(form,'sun','Selkent')]
    };
    document.getElementById('json-output').textContent = JSON.stringify(weekendJSON,null,2);
  });
  
  // Update preview on any input change
  document.getElementById('match-form').addEventListener('input', renderPreview);
  renderPreview(); // initial preview
  