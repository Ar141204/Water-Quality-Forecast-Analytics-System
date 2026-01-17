import pandas as pd
from prophet import Prophet

# Load the dataset
df = pd.read_csv('water_quality_dataset.csv')
df['ds'] = pd.to_datetime(df['date'], format='%Y-%m')

# Forecast function for any variable
def forecast_variable(df, column, months=12):
    temp_df = df[['ds', column]].rename(columns={column: 'y'})
    model = Prophet()
    model.fit(temp_df)

    future = model.make_future_dataframe(periods=months, freq='M')
    forecast = model.predict(future)
    
    result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    result['parameter'] = column
    return result

# Run forecast for all 3 variables
chlorophyll_forecast = forecast_variable(df, 'chlorophyll')
temperature_forecast = forecast_variable(df, 'temperature')
precipitation_forecast = forecast_variable(df, 'precipitation')

# Combine and save
all_forecasts = pd.concat([
    chlorophyll_forecast.assign(variable='chlorophyll'),
    temperature_forecast.assign(variable='temperature'),
    precipitation_forecast.assign(variable='precipitation')
])

all_forecasts.to_csv('combined_forecast.csv', index=False)
print("✅ Forecast saved as combined_forecast.csv")
