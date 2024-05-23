import express from "express";

import userRoutes from "./routes/userRoutes";
import workerRoutes from "./routes/workerRoutes";


const app = express();

const PORT = 4000;

app.use("/v1/user", userRoutes);
app.use("/v1/worker", workerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port - ${PORT}`);
});
