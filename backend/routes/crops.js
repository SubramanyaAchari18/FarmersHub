// import { Router } from "express";
// import { prisma } from "../utils/prismaClient.js";
// import { verifyJwt } from "../utils/verifyJwt.js";

// const router = Router();

// router.get("/", async (req, res, next) => {
//   try {
//     const { category, available, state, district } = req.query;
//     const crops = await prisma.crop.findMany({
//       where: {
//         category: category || undefined,
//         available: available === undefined ? undefined : available === "true",
//         locationState: state || undefined,
//         locationDistrict: district || undefined,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/my-crops", verifyJwt, async (req, res, next) => {
//   try {
//     const crops = await prisma.crop.findMany({
//       where: { farmerId: req.userId },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/", verifyJwt, async (req, res, next) => {
//   try {
//     const data = req.body;
//     const created = await prisma.crop.create({
//       data: {
//         farmerId: req.userId,
//         cropName: data.cropName,
//         category: data.category,
//         quantityKg: parseFloat(data.quantityKg),
//         pricePerKg: parseFloat(data.pricePerKg),
//         description: data.description || null,
//         locationVillage: data.locationVillage,
//         locationTaluk: data.locationTaluk || null,
//         locationDistrict: data.locationDistrict,
//         locationState: data.locationState,
//         imageUrl: data.imageUrl || null,
//       },
//     });
//     res.status(201).json(created);
//   } catch (err) {
//     next(err);
//   }
// });

// router.put("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     const updated = await prisma.crop.update({ where: { id: crop.id }, data: req.body });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     await prisma.crop.delete({ where: { id: crop.id } });
//     res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;

// import { Router } from "express";
// import { prisma } from "../utils/prismaClient.js";
// import { verifyJwt } from "../utils/verifyJwt.js";

// // --- 1. IMPORT THE NEW FUNCTION ---
// import {
//   getAvailableCrops,
//   // (You need to create this function in your controller)
// } from "../controllers/cropController.js"; 

// const router = Router();

// // --- 2. ADD THIS NEW ROUTE ---
// // This creates the GET /api/crops/available route
// router.get("/available", getAvailableCrops);

// // --- All your other routes are below ---

// router.get("/", async (req, res, next) => {
//   try {
//     const { category, available, state, district } = req.query;
//     const crops = await prisma.crop.findMany({
//       where: {
//         category: category || undefined,
//         available: available === undefined ? undefined : available === "true",
//         locationState: state || undefined,
//         locationDistrict: district || undefined,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/my-crops", verifyJwt, async (req, res, next) => {
//   try {
//     const crops = await prisma.crop.findMany({
//       where: { farmerId: req.userId },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/", verifyJwt, async (req, res, next) => {
//   try {
//     const data = req.body;
//     const created = await prisma.crop.create({
//       data: {
//         farmerId: req.userId,
//         cropName: data.cropName,
//         category: data.category,
//         quantityKg: parseFloat(data.quantityKg),
//         pricePerKg: parseFloat(data.pricePerKg),
//         description: data.description || null,
//         locationVillage: data.locationVillage,
//         locationTaluk: data.locationTaluk || null,
//         locationDistrict: data.locationDistrict,
//         locationState: data.locationState,
//         imageUrl: data.imageUrl || null,
//       },
//     });
//     res.status(201).json(created);
//   } catch (err) {
//     next(err);
//   }
// });

// router.put("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     const updated = await prisma.crop.update({ where: { id: crop.id }, data: req.body });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     await prisma.crop.delete({ where: { id: crop.id } });
//     res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;

// import { Router } from "express";
// import { prisma } from "../utils/prismaClient.js";
// import { verifyJwt } from "../utils/verifyJwt.js";

// // (We removed the controller import because it's not needed)

// const router = Router();

// // --- 1. THIS IS THE NEW ROUTE YOU NEED ---
// // This creates the GET /api/crops/available route
// router.get("/available", async (req, res, next) => {
//   try {
//     const crops = await prisma.crop.findMany({
//       where: {
//         available: true,
//         quantityKg: { gt: 0 }, // Only get crops that are in stock
//       },
//       // This is the most important part!
//       // It includes the farmer's name for your CropCard
//       include: {
//         farmer: {
//           include: {
//             profile: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// // --- 2. All your other routes are below ---

// router.get("/", async (req, res, next) => {
//   try {
//     const { category, available, state, district } = req.query;
//     const crops = await prisma.crop.findMany({
//       where: {
//         category: category || undefined,
//         available: available === undefined ? undefined : available === "true",
//         locationState: state || undefined,
//         locationDistrict: district || undefined,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/my-crops", verifyJwt, async (req, res, next) => {
//   try {
//     const crops = await prisma.crop.findMany({
//       where: { farmerId: req.userId },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(crops);
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/", verifyJwt, async (req, res, next) => {
//   try {
//     const data = req.body;
//     const created = await prisma.crop.create({
//       data: {
//         farmerId: req.userId,
//         cropName: data.cropName,
//         category: data.category,
//         quantityKg: parseFloat(data.quantityKg),
//         pricePerKg: parseFloat(data.pricePerKg),
//         description: data.description || null,
//         locationVillage: data.locationVillage,
//         locationTaluk: data.locationTaluk || null,
//         locationDistrict: data.locationDistrict,
//         locationState: data.locationState,
//         imageUrl: data.imageUrl || null,
//       },
//     });
//     res.status(201).json(created);
//   } catch (err) {
//     next(err);
//   }
// });

// router.put("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     const updated = await prisma.crop.update({ where: { id: crop.id }, data: req.body });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
//     if (!crop) return res.status(4404).json({ error: "Not found" });
//     if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     await prisma.crop.delete({ where: { id: crop.id } });
//     res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;
import { Router } from "express";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

// (We removed the controller import because it's not needed)

const router = Router();

// --- 1. THIS IS THE NEW ROUTE YOU NEED ---
// This creates the GET /api/crops/available route
router.get("/available", async (req, res, next) => {
  try {
    const crops = await prisma.crop.findMany({
      where: {
        available: true,
        quantityKg: { gt: 0 }, // Only get crops that are in stock
      },
      // This is the most important part!
      // It includes the farmer's name for your CropCard
      include: {
        farmer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(crops);
  } catch (err) {
    next(err);
  }
});

// --- 2. All your other routes are below ---

router.get("/", async (req, res, next) => {
  try {
    const { category, available, state, district } = req.query;
    const crops = await prisma.crop.findMany({
      where: {
        category: category || undefined,
        available: available === undefined ? undefined : available === "true",
        locationState: state || undefined,
        locationDistrict: district || undefined,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(crops);
  } catch (err) {
    next(err);
  }
});

router.get("/my-crops", verifyJwt, async (req, res, next) => {
  try {
    const crops = await prisma.crop.findMany({
      where: { farmerId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(crops);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const data = req.body;
    const created = await prisma.crop.create({
      data: {
        farmerId: req.userId,
        cropName: data.cropName,
        category: data.category,
        quantityKg: parseFloat(data.quantityKg),
        pricePerKg: parseFloat(data.pricePerKg),
        description: data.description || null,
        locationVillage: data.locationVillage,
        locationTaluk: data.locationTaluk || null,
        locationDistrict: data.locationDistrict,
        locationState: data.locationState,
        imageUrl: data.imageUrl || null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", verifyJwt, async (req, res, next) => {
  try {
    const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
    if (!crop) return res.status(404).json({ error: "Not found" });
    if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const updated = await prisma.crop.update({ where: { id: crop.id }, data: req.body });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", verifyJwt, async (req, res, next) => {
  try {
    const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
    if (!crop) return res.status(4404).json({ error: "Not found" });
    if (crop.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    await prisma.crop.delete({ where: { id: crop.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;