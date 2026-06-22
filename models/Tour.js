const { readData, writeData } = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const TOURS_FILE = 'Tours/index.json';

// تشخیص آدرس پایه سرور (لوکال یا رندر)
const getBaseUrl = () => {
    // اگر روی رندر باشیم، این متغیر توسط رندر یا خودمان (در کدهای قبلی) پر شده است
    if (process.env.RENDER_EXTERNAL_URL) {
        return process.env.RENDER_EXTERNAL_URL; // خروجی مثلاً: https://your-app.onrender.com
    }
    
    // اگر روی لوکال باشیم از پورت پیش‌فرض استفاده می‌کند
    const PORT = process.env.PORT || 6501;
    return `http://localhost:${PORT}`;
};

const getAllTours = async () => {
    let tours = await readData(TOURS_FILE);
    const baseUrl = getBaseUrl();

    // حذف await اضافه از روی map (چون مپ اصالتاً سینک است)
    tours = tours.map((tour) => {
        if (tour && tour.image) {
            // مطمئن می‌شویم که اگر آدرس از قبل کامل نبود، baseUrl را به اولش اضافه کنیم
            if (!tour.image.startsWith('http')) {
                tour.image = `${baseUrl}${tour.image}`;
            } else if (tour.image.includes('localhost:')) {
                // اگر از قبل لوکال‌هاست هاردکد شده بود، آن را با آدرس جدید جایگزین می‌کند
                tour.image = tour.image.replace(/http:\/\/localhost:\d+/, baseUrl);
            }
        }
        return tour;
    });

    return tours;
};

const getTourById = async (id) => {
    const tours = await readData(TOURS_FILE);
    let data = tours.find((tour) => tour.id === id); // حذف await اضافه از روی متد find
    const baseUrl = getBaseUrl();

    if (data && data.image) {
        if (!data.image.startsWith('http')) {
            data.image = `${baseUrl}${data.image}`;
        } else if (data.image.includes('localhost:')) {
            data.image = data.image.replace(/http:\/\/localhost:\d+/, baseUrl);
        }
    }
    return data;
};

const createTour = async (tourData) => {
    const tours = await readData(TOURS_FILE);
    const newTour = { id: uuidv4(), ...tourData };
    tours.push(newTour);
    await writeData(TOURS_FILE, tours);
    return newTour;
};

const updateTour = async (id, updatedData) => {
    const tours = await readData(TOURS_FILE);
    const index = tours.findIndex((tour) => tour.id === id);
    if (index === -1) return null;
    tours[index] = { ...tours[index], ...updatedData };
    await writeData(TOURS_FILE, tours);
    return tours[index];
};

const deleteTour = async (id) => {
    let tours = await readData(TOURS_FILE);
    const tourIndex = tours.findIndex((tour) => tour.id === id);
    if (tourIndex === -1) return null;
    const deletedTour = tours.splice(tourIndex, 1)[0];
    await writeData(TOURS_FILE, tours);
    return deletedTour;
};

module.exports = {
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
};