import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import chatbotRouter from "./routes/chatbotRoute.js"
import { initNlp } from "./nlp/nlpService.js"

// app config
const app = express()
const port = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/chatbot", chatbotRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

// Initialize database connection before starting server
const startServer = async () => {
    try {
        await connectDB()
        await connectCloudinary()
        await initNlp()
        
        // Start server only after database connection is established
        app.listen(port, () => console.log(`Server started on PORT:${port}`))
    } catch (error) {
        console.error("Failed to start server:", error.message)
        process.exit(1)
    }
}

startServer()