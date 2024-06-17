import express from "express";
import cors from "cors";

// import userRouter from "./routers/user"
// import workerRouter from "./routers/worker"
import userRoutes from "./routes/userRoutes";
import workerRoutes from "./routes/workerRoutes";

const app = express();

app.use(express.json());
app.use(cors());

// app.use("/v1/user", userRouter);
// app.use("/v1/worker", workerRouter);

app.use("/v1/user", userRoutes);
app.use("/v1/worker", workerRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running...`);
});
