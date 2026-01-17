# Intelligent Water Quality Forecasting System: A Detailed Project Report

**Author:** Mohamed Yaseen & Team
**Date:** January 2026

---

## 1. Abstract
The "Intelligent Water Quality Forecasting System" is a hybrid web application designed to monitor, analyze, and predict water quality metrics (specifically Chlorophyll-a) across the districts of Tamil Nadu. By leveraging an ensemble of machine learning models—Prophet, ARIMA, and LSTM—the system provides robust forecasts that outperform single-model approaches. Furthermore, the application integrates a "What-If" simulation engine, allowing policymakers and environmental engineers to assess the potential impact of climatic variables (Precipitation and Temperature) on future water quality. This report details the system's architecture, methodology, and implementation.

## 2. Introduction
Water quality management is becoming increasingly complex due to climate change. Traditional monitoring is reactive. This project aims to shift the paradigm to *proactive* management by predicting *Harmful Algal Blooms (HABs)* and other quality metrics before they become critical.

### 2.1 Objectives
1.  **Forecasting:** Generate accurate multi-month forecasts for Chlorophyll-a concentration.
2.  **Simulation:** Enable users to test scenarios (e.g., "What if rainfall increases by 20%?").
3.  **Visualization:** Provide an intuitive dashboard for ranking districts and identifying anomalies.
4.  **Accessibility:** Deliver the solution via a responsive Web Interface.

## 3. System Architecture
The application follows a classic Client-Server architecture, enhanced with a Data Science micro-service pattern.

### 3.1 Tech Stack
*   **Frontend:** HTML5, CSS3 (Glassmorphism UI), EJS (Embedded JavaScript Templating).
*   **Backend:** Node.js, Express.js.
*   **Computation Layer:** Python 3.x (Pandas, TensorFlow, Prophet, Scikit-Learn).
*   **Inter-Process Communication:** Node.js `child_process` spawns Python shells to execute heavy ML tasks on-demand.
*   **Data Storage:** CSV (Flat-file database for portability) containing historical water quality data.

### 3.2 Data Acquisition Layer (Google Earth Engine)
The foundation of our forecasting model is high-fidelity satellite data. We utilize **Google Earth Engine (GEE)** to process petabytes of geospatial datasets in the cloud and extract district-level aggregates.

*   **Datasets Utilized:**
    1.  **Chlorophyll-a:** `NASA/OCEANDATA/MODIS-Aqua/L3SMI` (Ocean Color) - Used as the primary target variable for water quality.
    2.  **Temperature:** `MODIS/061/MOD11A2` (Land Surface Temperature) - Cleaned and converted from Kelvin to Celsius.
    3.  **Precipitation:** `UCSB-CHG/CHIRPS/DAILY` (Infrared Power Station data) - Used to correlate rainfall runoff with water quality changes.
*   **Preprocessing Pipeline:**
    *   Temporal filtering (2022-2025).
    *   Spatial clipping to Tamil Nadu district boundaries (`FAO/GAUL`).
    *   Monthly composite generation to align with the forecasting time-step.

### 3.3 Data Flow
1.  **Data Extraction:** GEE Script exports processed CSVs/GeoTIFFs.
2.  **User Request:** User selects a district and parameters on the Web UI.
3.  **Server Handling:** Express.js receives the request at `/forecast` or `/api/analytics`.
4.  **Processing:** The server spawns a Python subprocess (`ensemble_model.py` or `get_analytics.py`).
5.  **Computation:** Python loads data, runs the ensemble models, performs simulations, and returns JSON.
6.  **Rendering:** The frontend renders the JSON data into interactive Charts (Chart.js) and Tables.

## 4. Methodology: The Ensemble Approach
One of the core innovations of this project is the use of an **Ensemble Model** to improve prediction accuracy.

### 4.1 The Models
We employ three distinct types of time-series models:
1.  **ARIMA (AutoRegressive Integrated Moving Average):**
    *   *Type:* Statistical / Linear.
    *   *Role:* Captures standard autocorrelations and moving averages. Good for short-term steps.
2.  **Prophet (by Meta):**
    *   *Type:* Additive Regression.
    *   *Role:* Excellent at handling seasonality and missing data. Serves as the robust "trend follower."
3.  **LSTM (Long Short-Term Memory):**
    *   *Type:* Recurrent Neural Network (Deep Learning).
    *   *Role:* Captures complex, non-linear dependencies and long-term sequences.

### 4.2 Ensemble Logic
The final forecast ($Y_{final}$) is the arithmetic mean of the individual model outputs:
$$ Y_{final} = \frac{Y_{Prophet} + Y_{ARIMA} + Y_{LSTM}}{3} $$
This averaging technique reduces the variance and overfitting risks associated with any single model.

### 4.3 Uncertainty Quantification
To provide decision confidence, we calculate Prediction Intervals. The system provides transparency by showing the range within which the true value is likely to fall.

## 5. "What-If" Simulation Engine
The simulation engine allows users to perturb input variables:
*   **Precipitation Factor ($P_f$):** Multiplier for rainfall (e.g., 1.2 for +20%).
*   **Temperature Bias ($T_b$):** Additive term for temperature (e.g., +2.0°C).

**Algorithm:**
1. Forecast future Precipitation and Temperature baselines.
2. Apply $P_f$ and $T_b$ to create a "Simulated Weather" scenario.
3. Calculate **Feature Importance** (Correlation) of Weather vs. Chlorophyll ($I_{precip}, I_{temp}$).
4. Adjust the Baseline Chlorophyll Forecast based on the weighted impact of the simulated weather changes.

## 6. Project Modules

### 6.1 Dashboard (Analytics)
*   **Leaderboard:** Ranks districts by average contamination levels.
*   **Risk Profile:** `Safe` (<5), `Warning` (5-10), `Critical` (>10) classification.
*   **Sparklines:** Mini-charts showing recent trends per district.

### 6.2 Forecast Interface
*   **Controls:** District selector, Date Range picker, Sliders for Simulation.
*   **Visualization:** Interactive line charts showing Historical Data, Forecast Line, and Confidence Intervals (Shaded Area).

## 7. Results and Performance
*   **Accuracy:** The ensemble model achieves a lower Mean Absolute Error (MAE) compared to individual models on validation sets.
*   **Latency:** Forecasts are generated in <2 seconds due to optimized data loading.
*   **Stability:** The system seamlessly handles missing data points (handled by Prophet) and outliers.

## 8. Conclusion
The Water Quality Forecast project successfully demonstrates how modern web technologies can be combined with advanced Data Science to solve real-world environmental problems. By democratizing access to complex forecasting models, we empower local authorities to make data-driven decisions for water safety.