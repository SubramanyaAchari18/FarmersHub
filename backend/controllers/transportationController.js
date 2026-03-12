// import { prisma } from "../utils/prismaClient.js";

// async function getRequestOr404(id) {
//   const request = await prisma.transportationRequest.findUnique({ where: { id } });
//   return request;
// }

// function forbidIfNotOwner(request, userId) {
//   if (!request) return;
//   const isOwner = request.farmerId === userId || request.buyerId === userId;
//   if (!isOwner) {
//     const err = new Error("Forbidden");
//     err.status = 403;
//     throw err;
//   }
// }

// export async function confirmOrder(req, res, next) {
//   try {
//     const id = req.params.id;
//     const request = await getRequestOr404(id);
//     if (!request) return res.status(404).json({ error: "Not found" });
//     // Only farmer can confirm pending -> confirmed
//     if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     if (request.status !== "pending") return res.status(400).json({ error: "Invalid status transition" });
//     const updated = await prisma.transportationRequest.update({
//       where: { id },
//       data: { status: "confirmed", updatedAt: new Date() },
//     });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function shipOrder(req, res, next) {
//   try {
//     const id = req.params.id;
//     const request = await getRequestOr404(id);
//     if (!request) return res.status(404).json({ error: "Not found" });
//     // Only farmer can move confirmed -> in_transit
//     if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     if (request.status !== "confirmed") return res.status(400).json({ error: "Invalid status transition" });
//     const updated = await prisma.transportationRequest.update({
//       where: { id },
//       data: { status: "in_transit", pickedUpAt: new Date(), updatedAt: new Date() },
//     });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function deliverOrder(req, res, next) {
//   try {
//     const id = req.params.id;
//     const request = await getRequestOr404(id);
//     if (!request) return res.status(404).json({ error: "Not found" });
//     // Only farmer can move in_transit -> delivered
//     if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     if (request.status !== "in_transit") return res.status(400).json({ error: "Invalid status transition" });
//     const updated = await prisma.transportationRequest.update({
//       where: { id },
//       data: { status: "delivered", deliveredAt: new Date(), updatedAt: new Date() },
//     });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function completeOrder(req, res, next) {
//   try {
//     const id = req.params.id;
//     const request = await getRequestOr404(id);
//     if (!request) return res.status(404).json({ error: "Not found" });
//     // Only buyer can move delivered -> completed
//     if (request.buyerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
//     if (request.status !== "delivered") return res.status(400).json({ error: "Invalid status transition" });
//     const updated = await prisma.transportationRequest.update({
//       where: { id },
//       data: { status: "completed", updatedAt: new Date() },
//     });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getFarmerRequests(req, res, next) {
//   try {
//     const items = await prisma.transportationRequest.findMany({
//       where: { farmerId: req.userId },
//       orderBy: { requestedAt: "desc" },
//     });
//     res.json(items);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getBuyerRequests(req, res, next) {
//   try {
//     const items = await prisma.transportationRequest.findMany({
//       where: { buyerId: req.userId },
//       orderBy: { requestedAt: "desc" },
//     });
//     res.json(items);
//   } catch (err) {
//     next(err);
//   }
// }
console.log("--- LOADING NEW transportationController.js ---");

import { prisma } from "../utils/prismaClient.js";

// ---
// HELPER FUNCTIONS
// ---

async function getRequestOr404(id) {
  const request = await prisma.transportationRequest.findUnique({ where: { id } });
  return request;
}

function forbidIfNotOwner(request, userId) {
  if (!request) return;
  const isOwner = request.farmerId === userId || request.buyerId === userId;
  if (!isOwner) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
}

// ---
// NEW FUNCTION TO CREATE THE ORDER
// ---

// export async function createOrder(req, res, next) {
//   try {
//     const data = req.body; // Data from your BuyNowModal
//     const loggedInUserId = req.userId; // This is the BUYER'S ID

//     // 1. Find the crop the buyer wants
//     const crop = await prisma.crop.findUnique({
//       where: { id: data.cropId },
//     });

//     if (!crop) {
//       return res.status(404).json({ error: "Crop not found" });
//     }

//     // 2. Get the farmerId AND pickupLocation from the crop
//     const farmerId = crop.farmerId;
    
//     // Build pickup location from crop location fields
//     // Use village, district, and state to create a complete address
//     const locationParts = [];
//     if (crop.locationVillage) locationParts.push(crop.locationVillage);
//     if (crop.locationDistrict) locationParts.push(crop.locationDistrict);
//     if (crop.locationState) locationParts.push(crop.locationState);
    
//     const pickupLocation = locationParts.length > 0 
//       ? locationParts.join(", ")
//       : crop.locationVillage || crop.locationDistrict || crop.locationState;

//     if (!pickupLocation) {
//       return res.status(400).json({ error: "Cannot find farmer's pickup location for this crop" });
//     }

//     // Generate a 4-digit OTP for delivery confirmation
//     const otp = String(Math.floor(1000 + Math.random() * 9000));

//     // 3. Now, create the request with all the data
//     const createdRequest = await prisma.transportationRequest.create({
//       data: {
//         cropId: data.cropId,
//         farmerId: farmerId,
//         buyerId: loggedInUserId,
//         quantityKg: data.quantityKg,
//         totalPrice: data.totalPrice,
//         pickupLocation: pickupLocation,
//         deliveryLocation: data.deliveryLocation,
//         status: "pending",
//         trackingNotes: null,
//         otp,
//       },
//     });

//     res.status(201).json(createdRequest);

//   } catch (err) {
//     next(err); // Send to error handler
//   }
// }
// ---
// NEW FUNCTION TO CREATE THE ORDER (FIXED)
// ---

export async function createOrder(req, res, next) {
    try {
      const data = req.body; // Data from your BuyNowModal
      const loggedInUserId = req.userId; // This is the BUYER'S ID
  
      // 🛑 FIX START 🛑
      // Determine the correct quantity to save. 
      // It checks for data.quantityKg first, then data.requestedQuantity,
      // which covers the most common parameter name mistakes.
      const requestedQuantity = data.quantityKg || data.requestedQuantity;
  
      if (!requestedQuantity) {
          return res.status(400).json({ error: "Quantity (quantityKg or requestedQuantity) is required" });
      }
      // 🛑 FIX END 🛑
  
      // 1. Find the crop the buyer wants
      const crop = await prisma.crop.findUnique({
        where: { id: data.cropId },
      });
  
      if (!crop) {
        return res.status(404).json({ error: "Crop not found" });
      }
  
      // 2. Get the farmerId AND pickupLocation from the crop
      const farmerId = crop.farmerId;
      
      // Build pickup location from crop location fields
      const locationParts = [];
      if (crop.locationVillage) locationParts.push(crop.locationVillage);
      if (crop.locationDistrict) locationParts.push(crop.locationDistrict);
      if (crop.locationState) locationParts.push(crop.locationState);
      
      const pickupLocation = locationParts.length > 0 
        ? locationParts.join(", ")
        : crop.locationVillage || crop.locationDistrict || crop.locationState;
  
      if (!pickupLocation) {
        return res.status(400).json({ error: "Cannot find farmer's pickup location for this crop" });
      }
  
      // Generate a 4-digit OTP for delivery confirmation
      const otp = String(Math.floor(1000 + Math.random() * 9000));
  
      // 3. Now, create the request with all the data
      const createdRequest = await prisma.transportationRequest.create({
        data: {
          cropId: data.cropId,
          farmerId: farmerId,
          buyerId: loggedInUserId,
          quantityKg: requestedQuantity, // 🛑 USING THE FIXED VARIABLE 🛑
          totalPrice: data.totalPrice,
          pickupLocation: pickupLocation,
          deliveryLocation: data.deliveryLocation,
          status: "pending",
          trackingNotes: null,
          otp,
        },
      });
  
      res.status(201).json(createdRequest);
  
    } catch (err) {
      next(err); // Send to error handler
    }
  }



// ---
// STATUS CHANGE FUNCTIONS
// ---

export async function confirmOrder(req, res, next) {
  try {
    const id = req.params.id;
    const {
      estimatedDeliveryAt,
      driverName,
      driverPhone,
      vehicleNumber,
      currentLocation,
      startShipping,
    } = req.body || {};
    const request = await getRequestOr404(id);
    if (!request) return res.status(404).json({ error: "Not found" });
    // Only farmer can confirm pending -> confirmed
    if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    if (request.status !== "pending") return res.status(400).json({ error: "Invalid status transition" });
    if (!estimatedDeliveryAt) {
      return res.status(400).json({ error: "estimatedDeliveryAt is required" });
    }
    // Build a human-readable tracking note to "notify" buyer
    const shippingNoteParts = [];
    if (currentLocation) shippingNoteParts.push(`Current location: ${currentLocation}`);
    if (driverName) shippingNoteParts.push(`Driver: ${driverName}`);
    if (driverPhone) shippingNoteParts.push(`Phone: ${driverPhone}`);
    if (vehicleNumber) shippingNoteParts.push(`Vehicle: ${vehicleNumber}`);
    const trackingNotes =
      shippingNoteParts.length > 0
        ? `Shipping details recorded. ${shippingNoteParts.join(" | ")}`
        : null;

    let updated = await prisma.transportationRequest.update({
      where: { id },
      data: {
        status: "confirmed",
        estimatedDeliveryAt: new Date(estimatedDeliveryAt),
        updatedAt: new Date(),
        ...(trackingNotes ? { trackingNotes } : {}),
      },
    });
    // Optionally begin shipping immediately
    if (startShipping) {
      updated = await prisma.transportationRequest.update({
        where: { id },
        data: { status: "in_transit", pickedUpAt: new Date(), updatedAt: new Date() },
      });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function shipOrder(req, res, next) {
  try {
    const id = req.params.id;
    const request = await getRequestOr404(id);
    if (!request) return res.status(404).json({ error: "Not found" });
    // Only farmer can move confirmed -> in_transit
    if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    if (request.status !== "confirmed") return res.status(400).json({ error: "Invalid status transition" });
    const updated = await prisma.transportationRequest.update({
      where: { id },
      data: { status: "in_transit", pickedUpAt: new Date(), updatedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deliverOrder(req, res, next) {
  try {
    const id = req.params.id;
    const request = await getRequestOr404(id);
    if (!request) return res.status(404).json({ error: "Not found" });
    // Only farmer can move in_transit -> delivered
    if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    if (request.status !== "in_transit") return res.status(400).json({ error: "Invalid status transition" });
    const updated = await prisma.transportationRequest.update({
      where: { id },
      data: { status: "delivered", deliveredAt: new Date(), updatedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function completeOrder(req, res, next) {
  try {
    const id = req.params.id;
    const { otp } = req.body || {};
    const request = await getRequestOr404(id);
    if (!request) return res.status(404).json({ error: "Not found" });
    // Only buyer can move delivered -> completed
    if (request.buyerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    if (request.status !== "delivered") return res.status(400).json({ error: "Invalid status transition" });
    if (!otp) {
      return res.status(400).json({ error: "otp is required" });
    }
    if (request.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    const updated = await prisma.transportationRequest.update({
      where: { id },
      data: { status: "completed", updatedAt: new Date(), otp: null },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ---
// CANCEL ORDER (NEW)
// ---
export async function cancelOrder(req, res, next) {
  try {
    const id = req.params.id;
    const { reason } = req.body || {};
    const request = await getRequestOr404(id);
    if (!request) return res.status(404).json({ error: "Not found" });
    // Only farmer (owner) can cancel a pending/confirmed request
    if (request.farmerId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    if (!["pending", "confirmed"].includes(request.status)) {
      return res.status(400).json({ error: "Only pending or confirmed orders can be cancelled" });
    }
    const updated = await prisma.transportationRequest.update({
      where: { id },
      data: {
        status: "cancelled",
        trackingNotes: reason || "Cancelled",
        updatedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ---
// UPDATED GETTER FUNCTIONS (with 'include')
// ---

export async function getFarmerRequests(req, res, next) {
  try {
    const items = await prisma.transportationRequest.findMany({
      where: { farmerId: req.userId },
      orderBy: { requestedAt: "desc" },
      // ADDED 'include' FOR FRONTEND
      include: {
        crop: true,
        buyer: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getBuyerRequests(req, res, next) {
  try {
    const items = await prisma.transportationRequest.findMany({
      where: { buyerId: req.userId },
      orderBy: { requestedAt: "desc" },
      // ADDED 'include' FOR FRONTEND
      include: {
        crop: true,
        farmer: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}