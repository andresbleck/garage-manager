const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  try {
    const registerRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyName: 'FamiliaVehicleTest',
        displayName: 'Vehicle Tester',
        email: 'vehicletest@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });

    const registerData = await registerRes.json();
    console.log('REGISTER', registerRes.status, registerData);

    const token = registerData.token;
    const vehicleRes = await fetch('http://localhost:3001/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        marca: 'Toyota',
        modelo: 'Corolla',
        patente: 'VEH123',
        año: 2024,
        foto_url: 'https://example.com/car.jpg',
      }),
    });

    const vehicleData = await vehicleRes.text();
    console.log('VEHICLE', vehicleRes.status, vehicleData);
  } catch (error) {
    console.error('ERROR', error);
  }
})();
