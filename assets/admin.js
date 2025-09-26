document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('match-form');
    const previewContainer = document.getElementById('preview-container');
    const jsonOutput = document.getElementById('json-output');
  
    // --- 1. Status toggle ---
    const statusSelectors = document.querySelectorAll('.status-select');
  
    statusSelectors.forEach(select => {
      const matchFields = select.closest('fieldset').querySelector('.match-fields');
  
      function toggleFields() {
        if (select.value !== 'scheduled') {
          matchFields.style.display = 'none';
          matchFields.querySelectorAll('input').forEach(input => input.readOnly = true);
        } else {
          matchFields.style.display = 'block';
          matchFields.querySelectorAll('input').forEach(input => input.readOnly = false);
        }
        renderPreview();
      }
  
      toggleFields(); // initial toggle
      select.addEventListener('change', toggleFields);
    });
  
    // --- 2. Build match object ---
    function buildMatch(prefix, league) {
      const fieldset = document.querySelector(`fieldset [name="${prefix}_status"]`).closest('fieldset');
      const status = fieldset.querySelector(`[name="${prefix}_status"]`).value;
  
      if (status !== 'scheduled') {
        return {
          league,
          date: fieldset.querySelector(`[name="${prefix}_date"]`)?.value || '',
          status,
          meeting_time: '',
          kickoff_time: '',
          home_team: '',
          away_team: '',
          venue: { name: '', address: '', maps_link: '', maps_embed: '' }
        };
      }
  
      const meeting = fieldset.querySelector(`[name="${prefix}_meeting_time"]`)?.value || '';
      let kickoff = fieldset.querySelector(`[name="${prefix}_kickoff_time"]`)?.value || '';
      if (!kickoff && meeting) {
        const [h, m] = meeting.split(':').map(Number);
        const date = new Date();
        date.setHours(h + 1, m);
        kickoff = date.toTimeString().slice(0, 5);
      }
  
      return {
        league,
        date: fieldset.querySelector(`[name="${prefix}_date"]`)?.value || '',
        status,
        meeting_time: meeting,
        kickoff_time: kickoff,
        home_team: fieldset.querySelector(`[name="${prefix}_home_team"]`)?.value || '',
        away_team: fieldset.querySelector(`[name="${prefix}_away_team"]`)?.value || '',
        venue: {
          name: fieldset.querySelector(`[name="${prefix}_venue_name"]`)?.value || '',
          address: fieldset.querySelector(`[name="${prefix}_venue_address"]`)?.value || '',
          maps_link: fieldset.querySelector(`[name="${prefix}_maps_link"]`)?.value || '',
          maps_embed: fieldset.querySelector(`[name="${prefix}_maps_embed"]`)?.value || ''
        }
      };
    }
  
    // --- 3. Render live preview ---
    function renderPreview() {
      if (!previewContainer) return;
      previewContainer.innerHTML = '';
  
      ['sat', 'sun'].forEach((prefix, i) => {
        const league = i === 0 ? 'JPL' : 'Selkent';
        const match = buildMatch(prefix, league);
  
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
  
        previewContainer.appendChild(card);
      });
    }
  
    // --- 4. Generate JSON ---
    form.addEventListener('submit', e => {
      e.preventDefault();
      const weekendJSON = {
        weekend: document.querySelector('[name="sat_date"]')?.value || '',
        matches: [buildMatch('sat', 'JPL'), buildMatch('sun', 'Selkent')]
      };
      if (jsonOutput) {
        jsonOutput.textContent = JSON.stringify(weekendJSON, null, 2);
      }
    });
  
    // --- 5. Update preview on input ---
    form.addEventListener('input', renderPreview);
  
    renderPreview(); // initial render
  });
  