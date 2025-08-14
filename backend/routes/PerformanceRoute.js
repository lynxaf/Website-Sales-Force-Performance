import express from "express";
import {
    uploadSalesPerformance,
    getPerformanceById,
    createPerformance,
    updatePerformance,
    deletePerformance
} from "../controllers/Products.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
const upload = multer({dest: "uploads/"})

router.post("/upload-performance", upload.single("file"), uploadSalesPerformance);
router.get('/products',verifyUser, getProducts);
router.get('/products/:id',verifyUser, getProductById);
router.post('/products',verifyUser, createProduct);
router.patch('/products/:id',verifyUser, updateProduct);
router.delete('/products/:id',verifyUser, deleteProduct);

export default router;