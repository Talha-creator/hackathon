import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import auditRoutes from "./routes/audit.routes.js";
import { ensureStorageDirs } from "./utils/file.utils.js";

ensureStorageDirs();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/welcome", (req: Request, res: Response) => {
  res.json({ message: "Welcome!" });
});

app.use("/api/audit", auditRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});