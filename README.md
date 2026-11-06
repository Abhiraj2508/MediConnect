# MediConnect 🏥

**MediConnect** is a full-stack healthcare appointment booking platform designed to connect patients with doctors through an easy-to-use digital healthcare system.

The platform provides patient registration, doctor discovery, online appointment booking, payment integration, doctor management, and an AI-powered chatbot to assist users with basic health queries.

## 🚀 Features

### 👤 Patient (Frontend)
- User registration and login
- Browse available doctors by speciality
- Book doctor appointments
- Manage and cancel appointments
- Update personal profile
- Online payments using Razorpay and Stripe
- AI-powered medical chatbot

### 🩺 Doctor Dashboard
- Secure doctor login
- View appointments
- Manage appointment availability
- Complete or cancel appointments
- Update doctor profile
- View dashboard statistics

### 🛠️ Admin Dashboard
- Admin authentication
- Dashboard with statistics
- Add new doctors
- Manage doctor availability
- View all doctors
- Manage patient appointments

### 🤖 AI Chatbot
- Basic health query assistance
- Symptom-based intent recognition
- Doctor speciality recommendations
- NLP-based chatbot with optional OpenAI integration

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Admin Panel | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Styling | Tailwind CSS |
| Payments | Razorpay, Stripe |
| Image Storage | Cloudinary |
| AI / NLP | Node-NLP, OpenAI API |
| API Requests | Axios |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
MediConnect/
│
├── admin/              # Admin and Doctor Dashboard
│   ├── src/
│   ├── public/
│   └── package.json
│
├── frontend/           # Patient-facing application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/            # Express.js REST API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── nlp/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Abhiraj2508/MediConnect.git
cd MediConnect
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your environment variables.

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the frontend folder.

### 4. Install Admin Dependencies

```bash
cd ../admin
npm install
```

Create a `.env` file inside the admin folder.

### 5. Run the Application

Start the backend:

```bash
cd backend
npm run server
```

Start the patient frontend in another terminal:

```bash
cd frontend
npm run dev
```

Start the admin dashboard in another terminal:

```bash
cd admin
npm run dev
```

## 🔐 Environment Variables

Configure the required environment variables in the respective `.env` files.

**Backend (`backend/.env`)**

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

STRIPE_SECRET_KEY=your_stripe_secret

CURRENCY=INR

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=your_openai_model
```

**Frontend (`frontend/.env`)**

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

**Admin (`admin/.env`)**

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=₹
```

Never upload actual `.env` files or secret credentials to GitHub.

## 🔒 Security

- JWT-based authentication
- Password hashing using bcrypt
- Protected admin and doctor routes
- Environment-based configuration
- Secure payment verification endpoints

## 👨‍💻 Developer

**Abhiraj Pratap Singh**

- GitHub: https://github.com/Abhiraj2508

## 📌 Project Status

Developed as a full-stack healthcare management and appointment booking project.

---

*Disclaimer: MediConnect is a software project for healthcare appointment management and basic health information assistance. It is not a replacement for professional medical diagnosis or emergency services.*