# Dress Mate 🌦️👕

*Your intelligent, weather-aware styling assistant.*

Dress Mate is a full-stack web application that provides personalized outfit suggestions based on real-time weather data. Its sophisticated backend logic analyzes a wide range of meteorological conditions and combines them with user preferences to recommend a complete, comfortable, and stylish outfit from a dynamic clothing database.



## ✨ Key Features

- **Dynamic Outfit Suggestions**: Get a complete, randomized outfit (top, bottom, and outerwear) suitable for the current weather.
- **Dual Mode Operation**:
  - **Auto Mode**: Uses your live geolocation to fetch real-time weather and air quality data.
  - **Manual Mode**: Allows you to input any weather condition to plan ahead.
- **Deep Personalization**: Tailors suggestions based on your selected **style** (Casual, Formal, Sporty, Party) and **gender**.
- **Complex Rule-Based Engine**: Considers temperature, wind, humidity, precipitation chance, and air quality to make nuanced decisions.
- **"Stay Home" Advisories**: Automatically issues warnings and recommends staying indoors during extreme weather conditions.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **APIs**: OpenWeatherMap One Call 3.0 API

---

## 🚀 How to Run This Project

Follow these steps to set up and run the project locally, based on the following structure:

### 1. Clone the Repository
First, clone the project repository from GitHub to your local machine.
```bash
git clone https://github.com/aaweshdas/Dress-Mate.git
```
Then, navigate into the newly created project folder:
```bash
cd Dress-Mate
```


### Prerequisites

- **Node.js** (v14 or later) and **NPM** (v10 or later)
- **MongoDB Community Server** & **MongoDB Shell (`mongosh`)** installed and running.
- An **API Key** from [OpenWeatherMap](https://openweathermap.org/api) with the **One Call API 3.0** plan subscribed (the free tier is sufficient).

### 2. Backend Setup

1.  **Navigate into the server directory:**
    ```bash
    cd server
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Inside the `server` folder, create a file named `.env` and add the following variables.

    ```
    # Your MongoDB connection string (update 'veda' if needed)
    MONGO_URI="mongodb+srv://subhankarDas:Subhankar18yrs%23@cluster0.vjgjl.mongodb.net/test"

    # A long, random, and secret string for JWT
    JWT_SECRET="your-super-secret-key-change-this"

    # Your API key from OpenWeatherMap
    OPENWEATHER_API_KEY="paste_your_api_key_here"    or use this    423385e62f1bb4b32a432c487a3db870

    PORT=3500
    ```

    > **How to Generate a `JWT_SECRET`** 🔑
    > This must be a long, random string. You can generate one from your terminal:
    > ```bash
    > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    > ```
    > Copy the output and paste it as the value for `JWT_SECRET` in `.env` file.


4.  **Start the backend server:**
    While still inside the `server` directory, run:
    ```bash
    node server.js
    ```
    or
    ```bash
    npm run dev
    ```
    
    You should see confirmation messages in your terminal:
    `Server running on port 3500`
    `MongoDB Connected`

### 3. Frontend Setup

1.  **No installation is needed** for the frontend.
2.  Open the **`login.html`** file in your browser to begin the application. It's recommended to use a live server extension in your code editor (like "Live Server" in VS Code) for the best experience.

---

## 🌐 API Endpoints

The backend provides the following API routes:

| Method | Route | Purpose & Protection |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Creates a new user account. (Public) |
| `POST` | `/api/v1/auth/login` | Logs in a user and returns a JWT. (Public) |
| `GET` | `/api/v1/suggestion` | Gets an outfit suggestion. (**Protected**, needs JWT) |
