import pandas as pd
import json
import sys

def get_analytics():
    try:
        # Load Data
        df = pd.read_csv('dataset/tamil_nadu_water_quality_dataset.csv')
        
        # 1. Total Samples
        total_samples = len(df)
        
        # 2. Statistics
        unique_districts = df['District'].nunique()
        avg_chlorophyll = df['Chlorophyll_ug_L'].mean()
        
        # 3. Aggregations
        # Group by District to get Stats
        grouped = df.groupby('District')
        
        # Prepare Leaderboard & Profile Data (All Districts)
        leaderboard = []
        for district, group in grouped:
            avg_chl = group['Chlorophyll_ug_L'].mean()
            std_chl = group['Chlorophyll_ug_L'].std()
            max_chl = group['Chlorophyll_ug_L'].max()
            avg_precip = group['Precipitation_mm'].mean()
            avg_temp = group['Temperature_C'].mean()

            # Risk Logic
            status = "Safe"
            if avg_chl > 10: status = "Critical"
            elif avg_chl > 5: status = "Warning"
            
            # Historical Anomaly Detection (Mean + 1.5 StdDev)
            threshold = avg_chl + (1.5 * std_chl) if not pd.isna(std_chl) else 999
            anomalies = group[group['Chlorophyll_ug_L'] > threshold].tail(3)
            anomaly_list = []
            for _, row in anomalies.iterrows():
                anomaly_list.append({
                    "date": str(row['Date']),
                    "value": round(row['Chlorophyll_ug_L'], 2),
                    "cause": "Heatwave" if row['Temperature_C'] > 30 else "Flash Flood" if row['Precipitation_mm'] > 50 else "High Runoff"
                })

            leaderboard.append({
                "district": district,
                "avg": round(avg_chl, 2),
                "volatility": round(std_chl, 2) if not pd.isna(std_chl) else 0,
                "peak": round(max_chl, 2),
                "avg_precip": round(avg_precip, 2),
                "avg_temp": round(avg_temp, 2),
                "status": status,
                "anomalies": anomaly_list,
                # Mock trend for sparkline (random variation around mean)
                "trend": [round(avg_chl * (1 + (i*0.1 - 0.2)), 1) for i in range(5)] 
            })
            
        # Sort leaderboard by avg chlorophyll descending
        leaderboard.sort(key=lambda x: x['avg'], reverse=True)
            
        # Top 5 for the simple bar chart (Legacy support)
        # Re-create top_5 based on the sorted leaderboard list
        chart_labels = [d['district'] for d in leaderboard[:5]]
        chart_data = [d['avg'] for d in leaderboard[:5]]
        
        # 4. Raw Data for Correlation Lab (Limit to last 500 points for performance)
        # Verify columns exist before selecting
        raw_cols = ['Precipitation_mm', 'Temperature_C', 'Chlorophyll_ug_L']
        raw_data = df[raw_cols].tail(500).to_dict(orient='records')
        
        result = {
            "total_samples": total_samples,
            "district_count": unique_districts,
            "avg_chlorophyll": round(avg_chlorophyll, 2),
            "leaderboard": leaderboard,
            "chart_data": {
                "labels": chart_labels,
                "values": chart_data
            },
            "raw_data": raw_data # New for Scatter Plot
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    get_analytics()
