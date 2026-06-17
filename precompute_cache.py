import time
from ensemble_model import forecast_ensemble

tamil_nadu_districts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
  "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram",
  "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli",
  "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
]

print("Starting cache precomputation for all districts...")
t_start = time.time()
for idx, district in enumerate(tamil_nadu_districts):
    t0 = time.time()
    # Precompute periods = 6 (default 2024 range)
    forecast_ensemble(district, "2024-01", "2024-06")
    # Precompute periods = 14 (default 2025-2026 range)
    forecast_ensemble(district, "2025-12", "2026-06")
    print(f"[{idx+1}/{len(tamil_nadu_districts)}] Precomputed {district} in {time.time() - t0:.2f}s")

print(f"Precomputation finished successfully in {time.time() - t_start:.2f} seconds!")
