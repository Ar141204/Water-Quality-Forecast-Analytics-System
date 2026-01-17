// Region : Tamil Nadu
var tamilNadu = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
                  .filter(ee.Filter.eq('ADM1_NAME', 'Tamil Nadu'));

// Date Range
var startYear = 2022;
var endYear = 2025;
var months = ee.List.sequence(1, 12);
var years = ee.List.sequence(startYear, endYear);

// Datasets NASA
var chlorA = ee.ImageCollection("NASA/OCEANDATA/MODIS-Aqua/L3SMI")
               .select('chlor_a');
//MODIS
var lst = ee.ImageCollection("MODIS/061/MOD11A2")
             .select('LST_Day_1km')
             .map(function(img) {
               return img.multiply(0.02).subtract(273.15).rename('temperature');
             });

var precip = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                .select('precipitation');

// Function to generate monthly mean images with all 3 features
var generateMonthlyComposite = function(year, month) {
  var start = ee.Date.fromYMD(year, month, 1);
  var end = start.advance(1, 'month');
  
  var chlor = chlorA.filterDate(start, end).mean().rename('chlorophyll');
  var temp = lst.filterDate(start, end).mean();
  var rain = precip.filterDate(start, end).mean().rename('precipitation');
  
  // Combine all bands, clip to Tamil Nadu
  var composite = ee.Image.cat([chlor, temp, rain])
    .clip(tamilNadu)
    .set('year', year)
    .set('month', month)
    .set('system:time_start', start.millis());
    
  return composite;
};

// Generate image collection
var monthlyImages = years.map(function(y) {
  return months.map(function(m) {
    return generateMonthlyComposite(ee.Number(y), ee.Number(m));
  });
}).flatten();

var monthlyCollection = ee.ImageCollection.fromImages(monthlyImages);

//Visualization
Map.centerObject(tamilNadu, 7);
Map.addLayer(monthlyCollection.first(), {
  bands: ['chlorophyll'],
  min: 0, max: 20, palette: ['blue', 'green', 'red']
}, 'Chlorophyll Preview');

print('Monthly Water Quality Collection', monthlyCollection.limit(5));

// Export each monthly composite with all 3 bands
var list = monthlyCollection.toList(monthlyCollection.size());

for (var i = 0; i < 48; i++) {
  var img = ee.Image(list.get(i));
  var year = ee.Number(img.get('year'));
  var month = ee.Number(img.get('month'));
  var name = ee.String('WaterQuality_')
                .cat(year.format('%04d')).cat('_')
                .cat(month.format('%02d'));

  Export.image.toDrive({
    image: img,
    description: 'WaterQuality_' + i, 
    folder: 'GEE_WaterQuality',
    fileNamePrefix: 'WaterQuality_'+year.format('%04d')+month.format('%02d'),
    region: tamilNadu.geometry(),
    scale: 1000,
    maxPixels: 1e13
  });
}
