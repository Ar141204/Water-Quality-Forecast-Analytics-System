// Chart instances storage
const chartInstances = {};

// Show alert message
function showAlert(message, type = 'info') {
  const alertBox = document.getElementById('alerts');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  alertBox.prepend(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alert);
    bsAlert.close();
  }, 5000);
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize date inputs with default values
function initDateInputs() {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  
  document.getElementById('start').valueAsDate = today;
  document.getElementById('end').valueAsDate = nextYear;
}

// Create chart with consistent styling
function createChart(canvasId, label, labels, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with id '${canvasId}' not found`);
    return null;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Create gradient for area under the line
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, `${color}33`);
  gradient.addColorStop(1, `${color}00`);
  
  // Destroy existing chart if it exists
  if (window[`${canvasId}Chart`]) {
    window[`${canvasId}Chart`].destroy();
  }
  
  window[`${canvasId}Chart`] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: gradient,
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${label}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6c757d',
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: '#6c757d'
          },
          beginAtZero: false
        }
      }
    }
  });
}

// Main forecast function
async function getForecast() {
  const district = $('#district').val();
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  
  // Input validation
  if (!district || !start || !end) {
    showAlert('Please fill in all fields', 'warning');
    return;
  }
  
  if (new Date(end) < new Date(start)) {
    showAlert('End date must be after start date', 'warning');
    return;
  }
  
  // Show loading state
  const forecastBtn = document.getElementById('forecast-btn');
  const loader = document.getElementById('loader');
  
  forecastBtn.disabled = true;
  forecastBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing...';
  loader.style.display = 'flex';
  
  try {
    // Make API request
    const response = await fetch(`/forecast?district=${encodeURIComponent(district)}&start=${start}&end=${end}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process and display data
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Update charts
    console.log('Raw data from server:', data);
    
    // Process precipitation data
    if (data.precipitation && Array.isArray(data.precipitation)) {
      const labels = data.precipitation.map(item => formatDate(item.ds));
      const values = data.precipitation.map(item => item.yhat);
      console.log('Precipitation data:', { labels, values });
      createChart('precipitationChart', 'Precipitation (mm)', labels, values, '#0d6efd');
    }
    
    // Process temperature data
    if (data.temperature && Array.isArray(data.temperature)) {
      const labels = data.temperature.map(item => formatDate(item.ds));
      const values = data.temperature.map(item => item.yhat);
      console.log('Temperature data:', { labels, values });
      createChart('temperatureChart', 'Temperature (°C)', labels, values, '#fd7e14');
    }
    
    // Process chlorophyll data
    if (data.chlorophyll && Array.isArray(data.chlorophyll)) {
      const labels = data.chlorophyll.map(item => formatDate(item.ds));
      const values = data.chlorophyll.map(item => item.yhat);
      console.log('Chlorophyll data:', { labels, values });
      createChart('chlorophyllChart', 'Chlorophyll (µg/L)', labels, values, '#20c997');
    }
    
    // Show alerts if any
    if (data.alerts && data.alerts.length > 0) {
      const alertBox = document.getElementById('alerts');
      const ul = document.createElement('ul');
      ul.className = 'list-group mt-3';
      
      data.alerts.forEach(alert => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-warning';
        li.textContent = alert;
        ul.appendChild(li);
      });
      
      alertBox.prepend(ul);
    }
    
    showAlert('Forecast data loaded successfully!', 'success');
    
    // Smooth scroll to charts
    document.querySelector('.row.g-4').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error fetching forecast:', error);
    showAlert(`Error: ${error.message || 'Failed to fetch forecast data'}`, 'danger');
  } finally {
    // Reset loading state
    forecastBtn.disabled = false;
    forecastBtn.innerHTML = '<i class="bi bi-lightning-charge-fill me-1"></i> Analyze';
    loader.style.display = 'none';
  }
}

// Initialize the application
function initApp() {
  // Set up event listeners
  document.getElementById('forecast-btn').addEventListener('click', getForecast);
  
  // Initialize date inputs
  initDateInputs();
  
  // Show welcome message
  setTimeout(() => {
    showAlert('Welcome to Water Quality Forecast! Select a district and date range to begin.', 'info');
  }, 1000);
}

// Run the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);