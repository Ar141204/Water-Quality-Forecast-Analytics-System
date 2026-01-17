import pandas as pd
import argparse
import json
from prophet import Prophet
from datetime import datetime


def forecast_variable(df, column_name, start, end):
    df_prophet = df[["Date", column_name]].copy()
    df_prophet.rename(columns={"Date": "ds", column_name: "y"}, inplace=True)
    df_prophet["ds"] = pd.to_datetime(df_prophet["ds"])
    model = Prophet()
    model.fit(df_prophet)
    future_dates = pd.date_range(start=start, end=end, freq='MS')
    future = pd.DataFrame({"ds": future_dates})
    forecast = model.predict(future)
    forecast = forecast[["ds", "yhat"]]
    forecast["ds"] = forecast["ds"].dt.strftime('%Y-%m-%d')
    return forecast

def generate_alerts(forecasts):
    alerts = []
    today = datetime.today().strftime('%Y-%m-%d')

    # Filter to current and future dates only
    def is_future(ds):
        return ds >= today

    for record in forecasts["chlorophyll"]:
        if is_future(record["ds"]) and record["yhat"] > 5:
            alerts.append(f"High chlorophyll level ({record['yhat']:.2f} µg/L) on {record['ds']}")

    for record in forecasts["temperature"]:
        if is_future(record["ds"]) and record["yhat"] > 35:
            alerts.append(f"High temperature ({record['yhat']:.2f} °C) on {record['ds']}")

    for record in forecasts["precipitation"]:
        if is_future(record["ds"]):
            if record["yhat"] < 20:
                alerts.append(f"Low precipitation ({record['yhat']:.2f} mm) on {record['ds']}")
            elif record["yhat"] > 300:
                alerts.append(f"Excess precipitation ({record['yhat']:.2f} mm) on {record['ds']}")

    return alerts

def forecast_all(district, start, end):
    df = pd.read_csv("./dataset/tamil_nadu_water_quality_dataset.csv")
    df = df[df["District"].str.lower() == district.lower()]
    if df.empty:
        return {"error": "District not found in dataset."}

    result = {
        "precipitation": forecast_variable(df, "Precipitation_mm", start, end).to_dict(orient="records"),
        "temperature": forecast_variable(df, "Temperature_C", start, end).to_dict(orient="records"),
        "chlorophyll": forecast_variable(df, "Chlorophyll_ug_L", start, end).to_dict(orient="records"),
    }
    result['alerts'] = generate_alerts(result)
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--district", required=True)
    parser.add_argument("--start", required=True)
    parser.add_argument("--end", required=True)
    args = parser.parse_args()

    output = forecast_all(args.district, args.start + "-01", args.end + "-01")
    print(json.dumps(output))
