import { Router } from "express";
import { FACILITY_BUILD_COST, PRODUCT_CATALOG } from "../types/game";
import { getWorldSnapshot } from "../services/worldService";

const router = Router();

router.get("/map", (_req, res) => {
  return res.json({
    ok: true,
    ...getWorldSnapshot(),
    productionCatalog: PRODUCT_CATALOG,
    facilityBuildCost: FACILITY_BUILD_COST
  });
});

export { router as worldRoutes };
