import swaggerJSDoc, { Options } from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "Booking App API",
    version: "1.0.0",
    description:
      "API documentation for the Booking App (hotels, restaurants, bookings, payments, notifications, roles, and users).",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Hotels" },
    { name: "Restaurants" },
    { name: "Bookings" },
    { name: "Payments" },
    { name: "Images" },
    { name: "Notifications" },
    { name: "Reviews" },
    { name: "Roles & Permissions" },
    { name: "Users" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          statusCode: { type: "integer" },
          data: { type: "object", nullable: true, additionalProperties: true },
          body: { type: "object", nullable: true, additionalProperties: true },
        },
        required: ["message", "statusCode"],
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 5 },
          totalItems: { type: "integer", example: 50 },
        },
      },
      SignUpRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          name: { type: "string" },
        },
        required: ["email", "password"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
        required: ["email", "password"],
      },
      Room: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          roomType: { type: "string", enum: ["SINGLE", "DOUBLE", "TWIN", "TRIPLE"] },
          price: { type: "number", example: 120 },
          image: { type: "array", items: { type: "string" } },
          amenities: { type: "array", items: { type: "string" } },
          quantity: { type: "integer", example: 2 },
        },
      },
      HotelPayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          location: { type: "string" },
          image: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          amenities: { type: "array", items: { type: "string" } },
          rooms: { type: "array", items: { $ref: "#/components/schemas/Room" } },
        },
        required: ["name", "location"],
      },
      RestaurantPayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          location: { type: "string" },
          description: { type: "string" },
          cuisine: { type: "array", items: { type: "string" } },
          seats: { type: "integer" },
          menu: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number" },
              },
            },
          },
          image: { type: "array", items: { type: "string" } },
        },
        required: ["name", "location"],
      },
      ReservationRequest: {
        type: "object",
        properties: {
          restaurantId: { type: "integer" },
          bookingDate: { type: "string", format: "date-time" },
          timeSlot: {
            type: "string",
            enum: ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT"],
          },
          partySize: { type: "integer" },
        },
        required: ["restaurantId", "bookingDate", "timeSlot", "partySize"],
      },
      RoomBookingRequest: {
        type: "object",
        properties: {
          roomId: { type: "integer" },
          bookingDate: { type: "string", format: "date" },
          quantity: { type: "integer" },
        },
        required: ["roomId", "bookingDate", "quantity"],
      },
      BookingStatusUpdateRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
          },
          type: { type: "string", enum: ["room", "restaurant"] },
        },
        required: ["status"],
      },
      ReviewRequest: {
        type: "object",
        properties: {
          userId: { type: "integer" },
          hotelId: { type: "integer" },
          restaurantId: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          review: { type: "string" },
        },
        required: ["userId", "rating"],
      },
      AssignPermissionsRequest: {
        type: "object",
        properties: {
          roleId: { type: "integer" },
          permissionIds: { type: "array", items: { type: "integer" } },
        },
        required: ["roleId", "permissionIds"],
      },
      AssignRoleRequest: {
        type: "object",
        properties: {
          roleId: { type: "integer" },
        },
        required: ["roleId"],
      },
      FcmTokenRequest: {
        type: "object",
        properties: { fcmToken: { type: "string" } },
        required: ["fcmToken"],
      },
      CheckoutSessionResponse: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
        },
        required: ["sessionId"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: { description: "Service is up" },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Sign up",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User logged in",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/hotels": {
      get: {
        tags: ["Hotels"],
        summary: "List hotels",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Paginated hotels",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
      post: {
        tags: ["Hotels"],
        summary: "Create hotel",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/HotelPayload" } },
          },
        },
        responses: {
          201: {
            description: "Hotel created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/hotels/{id}": {
      get: {
        tags: ["Hotels"],
        summary: "Get hotel details",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Hotel details",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Hotels"],
        summary: "Update hotel",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/HotelPayload" } },
          },
        },
        responses: {
          200: {
            description: "Hotel updated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
      delete: {
        tags: ["Hotels"],
        summary: "Delete hotel",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Hotel deleted" },
        },
      },
    },
    "/api/hotels/search/result": {
      get: {
        tags: ["Hotels"],
        summary: "Search hotels",
        parameters: [
          { in: "query", name: "location", schema: { type: "string" } },
          { in: "query", name: "name", schema: { type: "string" } },
          { in: "query", name: "roomType", schema: { type: "string" } },
          { in: "query", name: "minPrice", schema: { type: "string" } },
          { in: "query", name: "maxPrice", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    "/api/hotels/booked": {
      get: {
        tags: ["Hotels"],
        summary: "Check room availability",
        parameters: [
          { in: "query", name: "roomId", schema: { type: "integer" }, required: true },
          { in: "query", name: "date", schema: { type: "string", format: "date" }, required: true },
          { in: "query", name: "quantity", schema: { type: "integer" }, required: true },
        ],
        responses: {
          200: { description: "Availability result" },
          400: { description: "Missing parameters" },
        },
      },
    },
    "/api/restaurants": {
      get: {
        tags: ["Restaurants"],
        summary: "List restaurants",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Paginated restaurants",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
      post: {
        tags: ["Restaurants"],
        summary: "Create restaurant",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RestaurantPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Restaurant created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    "/api/restaurants/{id}": {
      get: {
        tags: ["Restaurants"],
        summary: "Get restaurant details",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Restaurant details" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Restaurants"],
        summary: "Update restaurant",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  location: { type: "string" },
                  cuisine: { type: "array", items: { type: "string" } },
                  seats: { type: "integer" },
                  menu: { type: "string", description: "JSON encoded array of menu items" },
                  timeSlots: { type: "array", items: { type: "string" } },
                  description: { type: "string" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Restaurant updated" },
        },
      },
    },
    "/api/restaurants/search/result": {
      get: {
        tags: ["Restaurants"],
        summary: "Search restaurants",
        parameters: [
          { in: "query", name: "name", schema: { type: "string" } },
          { in: "query", name: "location", schema: { type: "string" } },
          { in: "query", name: "ratings", schema: { type: "string" } },
          { in: "query", name: "cuisine", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Search results" },
        },
      },
    },
    "/api/restaurants/reservation/check": {
      get: {
        tags: ["Restaurants"],
        summary: "Check table availability",
        parameters: [
          { in: "query", name: "restaurantId", required: true, schema: { type: "integer" } },
          { in: "query", name: "date", required: true, schema: { type: "string", format: "date" } },
          { in: "query", name: "partySize", schema: { type: "integer" } },
          {
            in: "query",
            name: "timeSlot",
            required: true,
            schema: {
              type: "string",
              enum: ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT"],
            },
          },
        ],
        responses: {
          200: { description: "Availability result" },
        },
      },
    },
    "/api/restaurants/reservation": {
      post: {
        tags: ["Restaurants"],
        summary: "Reserve a table",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReservationRequest" },
            },
          },
        },
        responses: {
          200: { description: "Reservation created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/restaurants/reservation/{id}": {
      post: {
        tags: ["Restaurants"],
        summary: "Update reservation status",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookingStatusUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
        },
      },
    },
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List current user bookings",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Bookings list" },
        },
      },
    },
    "/api/bookings/admin": {
      get: {
        tags: ["Bookings"],
        summary: "List all bookings (admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Bookings list" },
        },
      },
    },
    "/api/bookings/status/{id}": {
      put: {
        tags: ["Bookings"],
        summary: "Update booking status",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookingStatusUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
        },
      },
    },
    "/api/bookings/room": {
      post: {
        tags: ["Bookings"],
        summary: "Book a room",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoomBookingRequest" } },
          },
        },
        responses: {
          201: { description: "Room booked" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/bookings/check-room": {
      get: {
        tags: ["Bookings"],
        summary: "Check room availability (alias)",
        parameters: [
          { in: "query", name: "roomId", required: true, schema: { type: "integer" } },
          { in: "query", name: "date", required: true, schema: { type: "string", format: "date" } },
          { in: "query", name: "quantity", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Availability result" },
        },
      },
    },
    "/api/payments/{id}": {
      post: {
        tags: ["Payments"],
        summary: "Create Stripe checkout session for booking",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" }, description: "Booking ID" },
        ],
        responses: {
          200: {
            description: "Session created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        body: { $ref: "#/components/schemas/CheckoutSessionResponse" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: "Booking not found" },
        },
      },
    },
    "/api/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Stripe webhook",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { type: "object" } },
          },
        },
        responses: {
          200: { description: "Webhook processed" },
          400: { description: "Signature verification failed" },
        },
      },
    },
    "/api/images/upload": {
      post: {
        tags: ["Images"],
        summary: "Upload image to Cloudinary",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                },
                required: ["image"],
              },
            },
          },
        },
        responses: {
          200: { description: "Image uploaded" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get user notifications",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Notifications list" },
        },
      },
    },
    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Notification updated" },
        },
      },
    },
    "/api/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "hotelId", schema: { type: "integer" } },
          { in: "query", name: "restaurantId", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Reviews list" },
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create review",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ReviewRequest" } },
          },
        },
        responses: {
          201: { description: "Review created" },
        },
      },
    },
    "/api/reviews/{id}": {
      put: {
        tags: ["Reviews"],
        summary: "Update review",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { rating: { type: "integer" }, review: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Review updated" },
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete review",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Review deleted" },
        },
      },
    },
    "/api/role-permission/roles": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List roles",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Roles list" },
        },
      },
    },
    "/api/role-permission/roles/{id}": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "Get role by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Role details" },
        },
      },
    },
    "/api/role-permission/permissions": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List permissions",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Permissions list" },
        },
      },
    },
    "/api/role-permission/permissions/{id}": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "Get permission by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Permission details" },
        },
      },
    },
    "/api/role-permission/assigned-permissions": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List assigned permissions",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Assigned permissions list" },
        },
      },
      post: {
        tags: ["Roles & Permissions"],
        summary: "Assign permissions to a role",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignPermissionsRequest" },
            },
          },
        },
        responses: {
          200: { description: "Permissions assigned" },
        },
      },
    },
    "/api/role-permission/assigned-permissions/{id}": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "Get permissions for a role",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Role permissions" },
        },
      },
    },
    "/api/role-permission/assigned-permissions/edit": {
      put: {
        tags: ["Roles & Permissions"],
        summary: "Replace permissions for a role",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignPermissionsRequest" },
            },
          },
        },
        responses: {
          200: { description: "Permissions updated" },
        },
      },
    },
    "/api/role-permission/assigned-roles": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List users with roles",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "User roles" },
        },
      },
    },
    "/api/role-permission/assigned-roles/{id}": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "Get role for a user",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "User role" },
        },
      },
      post: {
        tags: ["Roles & Permissions"],
        summary: "Assign role to user",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AssignRoleRequest" } },
          },
        },
        responses: {
          201: { description: "Role assigned" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Users list" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "User detail" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: {
          200: { description: "User updated" },
        },
      },
    },
    "/api/users/fcm": {
      put: {
        tags: ["Users"],
        summary: "Save Firebase token",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/FcmTokenRequest" } },
          },
        },
        responses: {
          200: { description: "Token saved" },
        },
      },
    },
  },
};

const options: Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
