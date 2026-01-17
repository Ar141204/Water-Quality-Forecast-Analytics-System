import rasterio
import os
import numpy as np
import pandas as pd

data_dir = './dataset'  # Folder with your .tif files
output = []

for file in sorted(os.listdir(data_dir)):
    if file.endswith('.tif'):
        filepath = os.path.join(data_dir, file)
        with rasterio.open(filepath) as src:
            data = src.read()
            bands = src.descriptions if src.descriptions else ['chlorophyll', 'temperature', 'precipitation']
            
            values = {}
            for i, band in enumerate(bands):
                band_data = data[i]
                band_data = np.where(band_data == src.nodata, np.nan, band_data)
                values[band] = np.nanmean(band_data)

        # Parse date from filename
        date = file.replace('WaterQuality_', '').replace('.tif', '')
        output.append({
            'date': date,
            'chlorophyll': round(values.get('chlorophyll', 0), 2),
            'temperature': round(values.get('temperature', 0), 2),
            'precipitation': round(values.get('precipitation', 0), 2)
        })

df = pd.DataFrame(output)
df.to_csv('water_quality_dataset.csv', index=False)
print('Saved water_quality_dataset.csv ✅')
