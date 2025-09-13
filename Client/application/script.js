class WeatherDashboard {
  constructor(token) {
    this.token = token;
    this.baseURL = "http://localhost:3500"; 
    this.isManualMode = false;
    this.isStyleDropdownOpen = false;
    this.isGenderMenuOpen = false; 
    this.weatherData = {};
    this.outfitData = {};
    this.selectedStyle = null;
    this.selectedGender = 'male'; 
    this.init();
  }
  init() {
    this.bindEvents();
  }
  bindEvents() {
    document.getElementById('auto-btn').addEventListener('click', () => this.setMode(false));
    document.getElementById('manual-btn').addEventListener('click', () => this.setMode(true));
    document.getElementById('style-card').addEventListener('click', () => this.toggleStyleDropdown());
    document.querySelectorAll('.style-option').forEach(option => {
      option.addEventListener('click', (e) => this.selectStyle(e.target.closest('.style-option')));
    });
    
    const resetButton = document.getElementById('reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', () => this.reset());
    }
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this.toggleGenderMenu();
      });
    }
    document.querySelectorAll('.gender-option').forEach(option => {
      option.addEventListener('click', () => {
        this.selectedGender = option.dataset.gender;
        console.log(`Gender set to: ${this.selectedGender}`);
        this.closeGenderMenu();
        this.handleDataFetch(); 
      });
    });

    ['temp', 'humidity', 'rain', 'wind', 'aqi', 'condition'].forEach(type => {
      const input = document.getElementById(`${type}-input`);
      if (input) {
        input.addEventListener('input', () => {
          if (this.isManualMode && this.selectedStyle) {
            this.fetchManual();
          }
        });
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.style-container')) {
        this.closeStyleDropdown();
      }
      if (!e.target.closest('.gender-menu') && !e.target.closest('#profile-btn')) {
        this.closeGenderMenu();
      }
    });
  }
    toggleGenderMenu() {
    this.isGenderMenuOpen = !this.isGenderMenuOpen;
    const menu = document.getElementById('gender-menu');
    if (menu) {
      menu.classList.toggle('show', this.isGenderMenuOpen);
    }
  }

  closeGenderMenu() {
    if (this.isGenderMenuOpen) {
      this.isGenderMenuOpen = false;
      const menu = document.getElementById('gender-menu');
      if (menu) {
        menu.classList.remove('show');
      }
    }
  }

  setMode(isManual) {
    this.isManualMode = isManual;
    document.getElementById('auto-btn').classList.toggle('active', !isManual);
    document.getElementById('manual-btn').classList.toggle('active', isManual);
    document.querySelectorAll('.value-input').forEach(input => input.classList.toggle('hidden', !isManual));
    document.querySelectorAll('.value-display').forEach(display => display.classList.toggle('hidden', isManual));
    this.reset();
  }

  async fetchAuto() {
    if (!this.selectedStyle) return alert("Please select a style first.");
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser!");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const gender = this.getSelectedGender();
      const url = `${this.baseURL}/api/v1/suggestion?lat=${latitude}&lon=${longitude}&style=${this.selectedStyle}&gender=${gender}`;

      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${this.token}` } });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        this.updateFromBackend(data);
      } catch (err) {
        console.error("Auto fetch error:", err);
        alert("Could not fetch suggestions.");
      }
    }, (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get your location.");
    });
  }

  async fetchManual() {
    if (!this.selectedStyle) return alert("Please select a style first.");

    const params = {
      style: this.selectedStyle,
      gender: this.getSelectedGender(),
      temp_celsius: document.getElementById('temp-input').value,
      humidity_percent: document.getElementById('humidity-input').value,
      precipitation_chance: document.getElementById('rain-input').value,
      wind_kph: document.getElementById('wind-input').value,
      aqi: document.getElementById('aqi-input').value,
      condition: document.getElementById('condition-input').value
    };
    
    if (!params.temp_celsius || !params.humidity_percent || !params.precipitation_chance || !params.wind_kph || !params.aqi || !params.condition) {
        console.log("Waiting for all manual inputs...");
        return; 
    }

    const queryParams = new URLSearchParams(params);
    try {
      const url = `${this.baseURL}/api/v1/suggestion?${queryParams.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${this.token}` } });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      this.updateFromBackend(data);
    } catch (err) {
      console.error("Manual fetch error:", err);
      alert("Could not fetch suggestions.");
    }
  }

  handleDataFetch() {
      if (!this.selectedStyle) return;
      if (this.isManualMode) {
          this.fetchManual();
      } else {
          this.fetchAuto();
      }
  }
    getSelectedGender() {
    return this.selectedGender;
  }
  updateFromBackend(data) {
    if (data.weather) {
      this.weatherData = data.weather;
      this.updateWeatherDisplay();
    }
    if (data.suggestion) {
      this.outfitData = data.suggestion;
      this.updateOutfitDisplay();
      this.showDialogues();
    }
  }

  updateWeatherDisplay() {
    document.getElementById('temp-display').textContent = `${this.weatherData.temp_celsius ?? 'N/A'}°C`;
    document.getElementById('humidity-display').textContent = `${this.weatherData.humidity_percent ?? 'N/A'}%`;
    document.getElementById('rain-display').textContent = `${this.weatherData.precipitation_chance ?? 'N/A'}%`;
    document.getElementById('wind-display').textContent = `${this.weatherData.wind_kph ?? 'N/A'} kph`;
    document.getElementById('aqi-display').textContent = this.weatherData.aqi ?? 'N/A';
    const conditionDisplay = document.getElementById('condition-display');
    if (conditionDisplay) {
        conditionDisplay.textContent = this.weatherData.condition ?? 'N/A';
    }
  }

  toggleStyleDropdown() {
    this.isStyleDropdownOpen = !this.isStyleDropdownOpen;
    document.getElementById('style-dropdown').classList.toggle('show', this.isStyleDropdownOpen);
    document.getElementById('chevron').classList.toggle('rotated', this.isStyleDropdownOpen);
  }

  closeStyleDropdown() {
    if (this.isStyleDropdownOpen) {
        this.isStyleDropdownOpen = false;
        document.getElementById('style-dropdown').classList.remove('show');
        document.getElementById('chevron').classList.remove('rotated');
    }
  }

  selectStyle(option) {
    const styleIcon = option.querySelector('.style-option-icon').textContent;
    const styleValue = option.dataset.style;
    document.querySelector('.style-icon').textContent = styleIcon;
    this.selectedStyle = styleValue;
    this.closeStyleDropdown();
    this.handleDataFetch();
  }

  showDialogues() {
    document.getElementById('upper-dialogue').classList.add('show');
    document.getElementById('lower-dialogue').classList.add('show');
    document.getElementById('coat-dialogue').classList.add('show');
    document.getElementById('accessories-dialogue').classList.add('show');
    document.getElementById('a-title').classList.add('show');
    const tipsDialogue = document.getElementById('tips-dialogue');
    if (tipsDialogue) tipsDialogue.classList.add('show');
  }
  
  hideDialogues() {
    document.getElementById('upper-dialogue').classList.remove('show');
    document.getElementById('lower-dialogue').classList.remove('show');
    document.getElementById('coat-dialogue').classList.remove('show');
    document.getElementById('accessories-dialogue').classList.remove('show');
    document.getElementById('a-title').classList.remove('show');
    const tipsDialogue = document.getElementById('tips-dialogue');
    if (tipsDialogue) tipsDialogue.classList.remove('show');
  }

  updateOutfitDisplay() {
    const defaultImg = 'https://placehold.co/100x100/e2e8f0/475569?text=N/A';
    const suggestion = this.outfitData || {};
    const outfits = suggestion.outfits || [];
    const accessories = suggestion.accessories || [];
    const tips = suggestion.additional_recommendations || [];
    const upper = outfits.find(o => o.type === 'upper') || outfits[0] || { name: 'N/A', image_url: defaultImg };
    const lower = outfits.find(o => o.type === 'lower') || outfits[1] || { name: 'N/A', image_url: defaultImg };
    const coat = outfits.find(o => o.type === 'outerwear') || outfits[2] || { name: 'Not needed', image_url: defaultImg };
    
    document.getElementById('upper-dialogue').innerHTML = this.createOutfitHTML('Upper Body', upper);
    document.getElementById('lower-dialogue').innerHTML = this.createOutfitHTML('Lower Body', lower);
    document.getElementById('coat-dialogue').innerHTML = this.createOutfitHTML('Outerwear', coat);
    const accessoriesBox = document.getElementById('accessories-dialogue');
    if (accessoriesBox) {
      accessoriesBox.innerHTML = ``;
      if (accessories.length > 0) {
        accessories.forEach(acc => {
            const itemHTML = `<div class="outfit-item "><img src="${acc.image_url || defaultImg}" class="access" alt="${acc.name}"><span class="outfit-text">${acc.name}</span></div>`;
            accessoriesBox.innerHTML += itemHTML;
        });
      } else {
        accessoriesBox.innerHTML += `<div class="tip-item">None needed</div>`;
      }
    }
    const tipsBox = document.getElementById('tips-dialogue');
    if (tipsBox) {
      tipsBox.innerHTML = `<div class="dialogue-title">Tips</div>`;
      if (tips.length > 0) {
        tips.forEach(tip => {
          tipsBox.innerHTML += `<div class="tip-item"><strong>${tip.type}:</strong> ${tip.message}</div>`;
        });
      } else {
        tipsBox.innerHTML += `<div class="tip-item">Stay comfortable!</div>`;
      }
    }
  }
  createOutfitHTML(title, item) {
    const defaultImg = 'https://placehold.co/100x100/e2e8f0/475569?text=N/A';
    return `
      <div class="dialogue-title">${title}</div>
      <div class="outfit-item">
        <img src="${item.image_url || defaultImg}" class="outfit-img" alt="${item.name}">
        <span class="outfit-text">${item.name}</span>
      </div>
    `;
  }

  reset() {
    console.log("Resetting dashboard...");
    this.weatherData = {};
    this.outfitData = {};
    this.selectedStyle = null;
    this.selectedGender = 'male'; 
    this.updateWeatherDisplay();
    this.hideDialogues();
    
    document.getElementById('upper-dialogue').innerHTML = `<div class="dialogue-title">Upper Body</div>`;
    document.getElementById('lower-dialogue').innerHTML = `<div class="dialogue-title">Lower Body</div>`;
    document.getElementById('coat-dialogue').innerHTML = `<div class="dialogue-title">Outerwear</div>`;
    // document.getElementById('accessories-dialogue').innerHTML = `<div class="dialogue-title">Accessories</div>`;
    const tipsDialogue = document.getElementById('tips-dialogue');
    if (tipsDialogue) tipsDialogue.innerHTML = `<div class="dialogue-title">Tips</div>`;

    ['temp', 'humidity', 'rain', 'wind', 'aqi', 'condition'].forEach(type => {
        const input = document.getElementById(`${type}-input`);
        if(input) input.value = '';
    });

    document.querySelector('.style-icon').textContent = '👔';
    this.closeStyleDropdown();
    this.closeGenderMenu(); 
  }
}

document.addEventListener('DOMContentLoaded', () => {  
  const token = sessionStorage.getItem('authToken');
  window.weatherDashboard = new WeatherDashboard(token);
});
const logoutButton = document.querySelector('.logout-btn');
function handleLogout() {
  const token = sessionStorage.getItem('authToken');
  if (token) {
      setTimeout(()=>{
        window.location.href = '../Auth/login.html';
      },500)
    }
  console.log('User logged out!')
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userEmail');
};
logoutButton.addEventListener('click', handleLogout);