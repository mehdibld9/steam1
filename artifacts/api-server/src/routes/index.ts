import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modsRouter from "./mods";
import adsRouter from "./ads";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(modsRouter);
router.use(adsRouter);
router.use(settingsRouter);

export default router;
