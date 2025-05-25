const API_KEY = 'YOUR_API_KEY'; // OpenWeatherMap API anahtarınızı buraya ekleyin
const CITY = 'Istanbul'; // Varsayılan şehir

export const getWeatherData = async () => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=tr`
    );

    if (!response.ok) {
      throw new Error('Hava durumu verisi alınamadı');
    }

    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Hava durumu verisi alınırken hata:', error);
    throw error;
  }
}; 