// import { Router } from "express";
// import {
//   completeOrder,
//   confirmOrder,
//   createOrder,
//   deliverOrder,
//   getBuyerRequests,
//   getFarmerRequests,
//   shipOrder,
// } from "../controllers/transportationController.js";
// import { prisma } from "../utils/prismaClient.js";
// import { verifyJwt } from "../utils/verifyJwt.js";

// const router = Router();

// router.get("/", verifyJwt, async (req, res, next) => {
//   try {
//     const items = await prisma.transportationRequest.findMany({
//       where: { OR: [{ farmerId: req.userId }, { buyerId: req.userId }] },
//       orderBy: { requestedAt: "desc" },
//     });
//     res.json(items);
//   } catch (err) {
//     next(err);
//   }
// });

// // Create new order - uses controller function that handles pickupLocation
// router.post("/", verifyJwt, createOrder);


// // router.post("/", verifyJwt, async (req, res, next) => {
// //   try {
// //     const data = req.body;
// //     const created = await prisma.transportationRequest.create({
// //       data: {
// //         cropId: data.cropId,
// //         farmerId: req.userId,
// //         buyerId: data.buyerId || null,
// //         quantityKg: data.quantityKg,
// //         totalPrice: data.totalPrice,
// //         pickupLocation: data.pickupLocation,
// //         deliveryLocation: data.deliveryLocation || null,
// //         status: "pending",
// //         trackingNotes: null,
// //       },
// //     });
// //     res.status(201).json(created);
// //   } catch (err) {
// //     next(err);
// //   }
// // });

// router.put("/:id", verifyJwt, async (req, res, next) => {
//   try {
//     const tr = await prisma.transportationRequest.findUnique({ where: { id: req.params.id } });
//     if (!tr) return res.status(404).json({ error: "Not found" });
//     if (tr.farmerId !== req.userId && tr.buyerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     const updated = await prisma.transportationRequest.update({ where: { id: tr.id }, data: req.body });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// });

// // Status transition routes
// router.patch("/:id/confirm", verifyJwt, confirmOrder);
// router.patch("/:id/ship", verifyJwt, shipOrder);
// router.patch("/:id/deliver", verifyJwt, deliverOrder);
// router.patch("/:id/complete", verifyJwt, completeOrder);

// // Convenience fetch routes (optional)
// router.get("/farmer/mine", verifyJwt, getFarmerRequests);
// router.get("/buyer/mine", verifyJwt, getBuyerRequests);

// export default router;




import { Router } from "express";
import {
  createOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  getFarmerRequests,
  getBuyerRequests,
} from "../controllers/transportationController.js";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

// ---
// MAIN ROUTES
// ---

// Create new order - uses the fixed controller
router.post("/", verifyJwt, createOrder);

// Get farmer's orders - uses the fixed controller with 'include'
router.get("/farmer/mine", verifyJwt, getFarmerRequests);

// Get buyer's orders - uses the fixed controller with 'include'
router.get("/buyer/mine", verifyJwt, getBuyerRequests);

// ---
// STATUS CHANGE ROUTES (SECURE)
// ---

router.patch("/:id/confirm", verifyJwt, confirmOrder);
router.patch("/:id/ship", verifyJwt, shipOrder);
router.patch("/:id/deliver", verifyJwt, deliverOrder);
router.patch("/:id/complete", verifyJwt, completeOrder);
router.patch("/:id/cancel", verifyJwt, cancelOrder);

// ---
// OTHER ROUTES (You can keep or remove this)
// ---

router.get("/", verifyJwt, async (req, res, next) => {
  try {
    const items = await prisma.transportationRequest.findMany({
      where: { OR: [{ farmerId: req.userId }, { buyerId: req.userId }] },
      orderBy: { requestedAt: "desc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

export default router;