import express from "express";

import userRoutes from "./routes/userRoutes";
import workerRoutes from "./routes/workerRoutes";

export const JWT_SECRET = "qazxswedcvfrtgbnhyujm";

const app = express();

app.use("/v1/user", userRoutes);
app.use("/v1/worker", workerRoutes);

app.listen(4000);
