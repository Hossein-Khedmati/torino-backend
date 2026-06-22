require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
let swaggerDocument = require("./swagger/swagger.json");
const path = require("path");

const app = express();

// ۱. تنظیم بهینه CORS برای احراز هویت و دسترسی فرانت‌اِند
app.use(
  cors({
    origin: true, // یا می‌توانید آدرس دقیق فرانت خود را بگذارید، true اجازه دسترسی به همه با حفظ credentials را می‌دهد
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));

// ۲. تنظیم پورت (اولویت با پورت رندر است، اگر نبود از ۶۵۰۰ داخل .env استفاده می‌کند)
const PORT = process.env.PORT || 6500;

const startServer = (port) => {
  const server = app.listen(port, async () => {
    console.log(`Server running on port ${port}`);

    // ۳. دینامیک کردن آدرس‌های Swagger برای هماهنگی با لوکال و سرور آنلاین Render
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.RENDER;
    const serverUrl = isProduction
      ? `https://${process.env.RENDER_EXTERNAL_URL || "your-app-name.onrender.com"}`
      : `http://localhost:${port}`;

    swaggerDocument.servers = [
      {
        url: serverUrl,
        description: isProduction
          ? "Production Server (Render)"
          : "Local server",
      },
    ];

    // اعمال داکیومنت Swagger بعد از مشخص شدن آدرس سرور
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log(`Swagger API docs are available at ${serverUrl}/api-docs`);
  });

  // مکانیزم تغییر پورت خودکار در لوکال (رندر به این بخش نیازی ندارد چون پورتش فیکس است)
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is in use, trying port ${+port + 1}...`);
      startServer(+port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer(PORT);

// روت‌ها و بقیه جزییات برنامه شما
app.use(require("./routes/dev"));
app.use("/auth", require("./routes/auth"));
app.use("/tour", require("./routes/tour"));
app.use("/basket", require("./routes/basket"));
app.use("/user", require("./routes/user"));
app.use("/order", require("./routes/order"));

app.get("/", (req, res) => {
  res.send("Welcome to the Tour and Travel Agency API!");
});
