import { PrismaClient, RoomType, TimeSlotType } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const permissions = [
  // User management
  "GET_USER",
  "UPDATE_USER",
  // Role & permission reads/assignments
  "GET_ROLE",
  "GET_PERMISSION",
  "GET_ASSIGNED_PERMISSION",
  "ASSIGN_PERMISSION",
  "ASSIGN_ROLE",
  // Domain management
  "MANAGE_HOTEL",
  "MANAGE_RESTAURANT",
  "MANAGE_BOOKING",
];

const roles = [
  { name: "ADMIN", permissions },
  {
    name: "STAFF",
    permissions: [
      "GET_USER",
      "UPDATE_USER",
      "MANAGE_HOTEL",
      "MANAGE_RESTAURANT",
      "MANAGE_BOOKING",
    ],
  },
  {
    name: "USER",
    permissions: [
      // keep empty; access is driven by auth-only endpoints
    ],
  },
];

const hotelsSeed: Array<{
  name: string;
  location: string;
  image: string[];
  description: string;
  amenities: string[];
  rooms: Array<{
    roomType: RoomType;
    price: number;
    quantity: number;
    image: string[];
    amenities: string[];
  }>;
}> = [
  {
    name: "Cox's Bay Resort",
    location: "Cox's Bazar, Bangladesh",
    image: [
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb210cc",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],
    description: "Beachfront property with panoramic views of the Bay of Bengal.",
    amenities: ["Infinity Pool", "Private Beach", "Airport Shuttle", "Halal Buffet"],
    rooms: [
      {
        roomType: RoomType.DOUBLE,
        price: 220,
        quantity: 8,
        image: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
        amenities: ["Ocean View", "Balcony", "Mini Bar"],
      },
      {
        roomType: RoomType.TRIPLE,
        price: 420,
        quantity: 3,
        image: ["https://images.unsplash.com/photo-1505691723518-36a5ac3be353"],
        amenities: ["Living Area", "Butler Service"],
      },
    ],
  },
  {
    name: "Sajek Valley Retreat",
    location: "Sajek, Bangladesh",
    image: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba",
    ],
    description: "Boutique eco-resort nestled in the hills of Rangamati.",
    amenities: ["Sunset Deck", "Heritage Tours", "Bonfire Lounge"],
    rooms: [
      {
        roomType: RoomType.TWIN,
        price: 180,
        quantity: 10,
        image: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
        amenities: ["Mountain View", "Workspace"],
      },
      {
        roomType: RoomType.DOUBLE,
        price: 260,
        quantity: 4,
        image: ["https://images.unsplash.com/photo-1505691723518-36a5ac3be353"],
        amenities: ["Fireplace", "Balcony"],
      },
    ],
  },
];

const restaurantsSeed: Array<{
  name: string;
  location: string;
  description: string;
  cuisine: string[];
  timeSlots: TimeSlotType[];
  image: string[];
  seats: number;
  menu: Array<{ name: string; price: number }>;
}> = [
  {
    name: "Dhaka Skyline Dining",
    location: "Dhaka, Bangladesh",
    description: "Contemporary Bangladeshi tasting menu with rooftop views of Gulshan.",
    cuisine: ["Bangladeshi", "Fusion"],
    timeSlots: [TimeSlotType.EVENING, TimeSlotType.NIGHT],
    image: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9",
    ],
    seats: 60,
    menu: [
      { name: "Chingri Malai Curry", price: 1800 },
      { name: "Hilsa Platter", price: 2200 },
    ],
  },
  {
    name: "Sylhet Tea Garden Cafe",
    location: "Sylhet, Bangladesh",
    description: "Tea-inspired cafe offering Sylheti snacks and specialty brews.",
    cuisine: ["Tea House", "Snacks"],
    timeSlots: [TimeSlotType.MORNING, TimeSlotType.NOON, TimeSlotType.AFTERNOON],
    image: [
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
    ],
    seats: 80,
    menu: [
      { name: "Pitha Platter", price: 450 },
      { name: "Seven-Layer Tea", price: 380 },
    ],
  },
];

async function createDefaultPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
  }
}

async function createDefaultRoles() {
  for (const role of roles) {
    const rolePermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: role.permissions,
        },
      },
    });

    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        rolePermission: {
          createMany: {
            data: rolePermissions.map((permission) => ({
              permissionId: permission.id,
            })),
            skipDuplicates: true,
          },
        },
      },
    });
  }
}

async function upsertUser({
  email,
  roleName,
  phone,
  name,
}: {
  email: string;
  roleName: string;
  phone?: string;
  name: string;
}) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }
  const hashedPassword = await bcrypt.hash("Password@123", 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
      phone,
      roleId: role.id,
    },
  });
}

async function createUsers() {
  await Promise.all([
    upsertUser({ email: "admin@example.com", roleName: "ADMIN", name: "Admin User" }),
    upsertUser({
      email: "staff@example.com",
      roleName: "STAFF",
      name: "Front Desk Staff",
      phone: "01700111222",
    }),
    upsertUser({
      email: "user@example.com",
      roleName: "USER",
      name: "Arif Rahman",
      phone: "01733999888",
    }),
  ]);
}

async function seedHotels() {
  for (const hotel of hotelsSeed) {
    const existing = await prisma.hotel.findFirst({ where: { name: hotel.name } });
    if (existing) continue;
    await prisma.hotel.create({
      data: {
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        amenities: hotel.amenities,
        image: hotel.image,
        rooms: {
          create: hotel.rooms.map((room) => ({
            roomType: room.roomType,
            price: room.price,
            quantity: room.quantity,
            image: room.image,
            amenities: room.amenities,
          })),
        },
      },
    });
  }
}

async function seedRestaurants() {
  for (const restaurant of restaurantsSeed) {
    const existing = await prisma.restaurant.findFirst({ where: { name: restaurant.name } });
    if (existing) continue;
    await prisma.restaurant.create({
      data: {
        name: restaurant.name,
        description: restaurant.description,
        location: restaurant.location,
        cuisine: restaurant.cuisine,
        image: restaurant.image,
        seats: restaurant.seats,
        timeSlots: restaurant.timeSlots,
        menu: restaurant.menu,
      },
    });
  }
}

async function seedBookingsReviewsPayments() {
  const user = await prisma.user.findUnique({ where: { email: "user@example.com" } });
  if (!user) return;

  const hotel = await prisma.hotel.findFirst({ include: { rooms: true } });
  const restaurant = await prisma.restaurant.findFirst();
  if (!hotel || !restaurant || hotel.rooms.length === 0) return;

  const [room] = hotel.rooms;

  const existingRoomBooking = await prisma.booking.findFirst({
    where: { userId: user.id, roomId: room.id },
  });

  if (!existingRoomBooking) {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: room.id,
        bookingDate: new Date("2024-08-15T15:00:00.000Z"),
        totalPrice: room.price * 2,
        roomQuantity: 2,
        status: "CONFIRMED",
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: "USD",
        status: "SUCCEEDED",
        stripeSessionId: `seed-room-session-${booking.id}`,
        stripePaymentIntentId: `seed-room-intent-${booking.id}`,
      },
    });
  }

  const existingRestaurantBooking = await prisma.booking.findFirst({
    where: { userId: user.id, restaurantId: restaurant.id },
  });

  if (!existingRestaurantBooking) {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        bookingDate: new Date("2024-08-20T19:30:00.000Z"),
        totalPrice: 180,
        partySize: 4,
        timeSlot: "EVENING",
        status: "PENDING",
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: "USD",
        status: "PENDING",
        stripeSessionId: `seed-restaurant-session-${booking.id}`,
      },
    });
  }

  const existingHotelReview = await prisma.review.findFirst({
    where: { userId: user.id, hotelId: hotel.id },
  });
  if (!existingHotelReview) {
    await prisma.review.create({
      data: {
        userId: user.id,
        hotelId: hotel.id,
        rating: 5,
        review: "Outstanding stay with fantastic service.",
      },
    });
  }

  const existingRestaurantReview = await prisma.review.findFirst({
    where: { userId: user.id, restaurantId: restaurant.id },
  });
  if (!existingRestaurantReview) {
    await prisma.review.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        rating: 4,
        review: "Great flavors and ambiance. Will visit again.",
      },
    });
  }

  const notifications = [
    {
      userId: user.id,
      title: "Booking Confirmed",
      body: "Your room reservation has been confirmed.",
      metadata: { type: "booking", scope: "hotel" },
    },
    {
      userId: user.id,
      title: "Pending Payment",
      body: "Finish payment to confirm your restaurant reservation.",
      metadata: { type: "booking", scope: "restaurant" },
    },
  ];

  for (const note of notifications) {
    const exists = await prisma.notification.findFirst({
      where: { userId: note.userId, title: note.title },
    });
    if (!exists) {
      await prisma.notification.create({ data: note });
    }
  }
}

async function main() {
  await createDefaultPermissions();
  await createDefaultRoles();
  await createUsers();
  await seedHotels();
  await seedRestaurants();
  await seedBookingsReviewsPayments();

  console.log("Seed data created: roles, users, hotels, restaurants, bookings, payments, and notifications.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
