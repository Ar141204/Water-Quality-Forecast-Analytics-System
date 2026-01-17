import rasterio
import numpy as np
import matplotlib.pyplot as plt

# Load GeoTIFF file
tif_path = 'dataset/TamilNadu_Chlorophyll.tif' 
with rasterio.open(tif_path) as src:
    chlor_data = src.read(1)
    profile = src.profile

# Mask out no-data values
chlor_data = np.where(chlor_data == src.nodata, np.nan, chlor_data)

# Plot the raster
plt.imshow(chlor_data, cmap='viridis')
plt.title("Mean Chlorophyll")
plt.colorbar(label='mg/m³')
plt.show()

# Calculate average chlorophyll for the region
mean_chlor = np.nanmean(chlor_data)
print(f"Average Chlorophyll-a: {mean_chlor:.2f} mg/m³")
