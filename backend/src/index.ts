import express from "express";

import userRoutes from "./routes/userRoutes";
import workerRoutes from "./routes/workerRoutes";

const PORT = 4000;

const app = express();

// middlewares
app.use(express.json());

// Routes
app.use("/v1/user", userRoutes);
app.use("/v1/worker", workerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running...`);
});
