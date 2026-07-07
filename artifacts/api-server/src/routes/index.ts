import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modsRouter from "./mods";
import adsRouter from "./ads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(modsRouter);
router.use(adsRouter);

export default router;
