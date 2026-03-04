// Resume PDF API endpoint
import { Router } from "express";
const router = Router();

router.get("/download", (req, res) => {
  // Placeholder for PDF generation
  res.send("Resume PDF download");
});

export default router;
