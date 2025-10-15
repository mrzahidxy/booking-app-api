import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking App API',
      version: '1.0.0',
      description: 'API documentation for the Booking App - Hotel and Restaurant Reservations',
    },
    servers: [
      {
        url: '/api',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string' },
            roleId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updateAt: { type: 'string', format: 'date-time' },
          },
        },
        Hotel: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            amenities: { type: 'array', items: { type: 'string' } },
            image: { type: 'string' },
            rooms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  roomType: { type: 'string', enum: ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'] },
                  price: { type: 'number' },
                  image: { type: 'string' },
                  amenities: { type: 'array', items: { type: 'string' } },
                  quantity: { type: 'integer' },
                },
              },
            },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            location: { type: 'string' },
            cuisine: { type: 'string' },
            seats: { type: 'integer' },
            image: { type: 'string' },
            description: { type: 'string' },
            menu: { type: 'string' },
            bookings: { type: 'array', items: { type: 'object' } },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            bookingDate: { type: 'string', format: 'date-time' },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
            roomQuantity: { type: 'integer' },
            partySize: { type: 'integer' },
            userId: { type: 'integer' },
            roomId: { type: 'integer' },
            restaurantId: { type: 'integer' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email address' },
            password: { type: 'string', minLength: 6, description: 'User password' },
            name: { type: 'string', description: 'User full name' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email address' },
            password: { type: 'string', description: 'User password' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string' },
            token: { type: 'string', description: 'JWT authentication token' },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'integer' },
                totalPages: { type: 'integer' },
                totalItems: { type: 'integer' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'object' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/auth/signup': {
        post: {
          summary: 'User signup',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignupRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            400: {
              description: 'Bad request - User already exists or validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'User login',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/LoginResponse' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Bad request - Wrong password',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/users': {
        get: {
          summary: 'Get all users with pagination',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of users per page',
            },
          ],
          responses: {
            200: {
              description: 'Users fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/User' },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'No users found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/users/{id}': {
        get: {
          summary: 'Get user by ID',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'User ID',
            },
          ],
          responses: {
            200: {
              description: 'User fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/User' },
                              {
                                properties: {
                                  bookings: { type: 'array', items: { type: 'object' } },
                                  review: { type: 'array', items: { type: 'object' } },
                                  notification: { type: 'array', items: { type: 'object' } },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update user by ID',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'User ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'User full name' },
                    email: { type: 'string', format: 'email', description: 'User email address' },
                    phone: { type: 'string', description: 'User phone number' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/User' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/users/fcm': {
        put: {
          summary: 'Save FCM token for user notifications',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fcmToken'],
                  properties: {
                    fcmToken: { type: 'string', description: 'Firebase Cloud Messaging token for push notifications' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'FCM token saved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/User' },
                              {
                                properties: {
                                  fcmToken: { type: 'string' },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Bad request - Missing user ID or FCM token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/hotels': {
        get: {
          summary: 'Get all hotels with pagination',
          tags: ['Hotels'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of hotels per page',
            },
          ],
          responses: {
            200: {
              description: 'Hotels fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Hotel' },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a new hotel',
          tags: ['Hotels'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'location'],
                  properties: {
                    name: { type: 'string', description: 'Hotel name' },
                    location: { type: 'string', description: 'Hotel location' },
                    description: { type: 'string', description: 'Hotel description' },
                    amenities: { type: 'array', items: { type: 'string' }, description: 'List of hotel amenities' },
                    image: { type: 'string', description: 'Hotel image URL' },
                    rooms: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          roomType: { type: 'string', enum: ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'] },
                          price: { type: 'number' },
                          image: { type: 'string' },
                          amenities: { type: 'array', items: { type: 'string' } },
                          quantity: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Hotel created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Hotel' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/hotels/{id}': {
        get: {
          summary: 'Get detailed hotel information including rooms and reviews',
          tags: ['Hotels'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Hotel ID',
            },
          ],
          responses: {
            200: {
              description: 'Hotel details fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/Hotel' },
                              {
                                properties: {
                                  reviews: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        id: { type: 'integer' },
                                        rating: { type: 'number' },
                                        comment: { type: 'string' },
                                        user: { $ref: '#/components/schemas/User' },
                                      },
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Hotel not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update an existing hotel',
          tags: ['Hotels'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Hotel ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Hotel name' },
                    location: { type: 'string', description: 'Hotel location' },
                    description: { type: 'string', description: 'Hotel description' },
                    amenities: { type: 'array', items: { type: 'string' }, description: 'List of hotel amenities' },
                    image: { type: 'string', description: 'Hotel image URL' },
                    rooms: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', description: 'Room ID (for updates)' },
                          roomType: { type: 'string', enum: ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'] },
                          price: { type: 'number' },
                          image: { type: 'string' },
                          amenities: { type: 'array', items: { type: 'string' } },
                          quantity: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Hotel updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Hotel' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Hotel not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete a hotel',
          tags: ['Hotels'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Hotel ID',
            },
          ],
          responses: {
            200: {
              description: 'Hotel deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Hotel' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Hotel not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/hotels/search/result': {
        get: {
          summary: 'Search hotels by location, price range, room type, and name',
          tags: ['Hotels'],
          parameters: [
            {
              in: 'query',
              name: 'location',
              schema: { type: 'string' },
              description: 'Hotel location (case-insensitive search)',
            },
            {
              in: 'query',
              name: 'minPrice',
              schema: { type: 'number' },
              description: 'Minimum room price',
            },
            {
              in: 'query',
              name: 'maxPrice',
              schema: { type: 'number' },
              description: 'Maximum room price',
            },
            {
              in: 'query',
              name: 'roomType',
              schema: { type: 'string', enum: ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'] },
              description: 'Room type',
            },
            {
              in: 'query',
              name: 'name',
              schema: { type: 'string' },
              description: 'Hotel name (case-insensitive search)',
            },
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of hotels per page',
            },
          ],
          responses: {
            200: {
              description: 'Hotels fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Hotel' },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/hotels/booked': {
        get: {
          summary: 'Check room availability for booking',
          tags: ['Hotels'],
          parameters: [
            {
              in: 'query',
              name: 'roomId',
              required: true,
              schema: { type: 'string' },
              description: 'Room ID to check availability for',
            },
            {
              in: 'query',
              name: 'date',
              required: true,
              schema: { type: 'string', format: 'date' },
              description: 'Date to check availability for (YYYY-MM-DD)',
            },
            {
              in: 'query',
              name: 'quantity',
              required: true,
              schema: { type: 'string' },
              description: 'Number of rooms requested',
            },
          ],
          responses: {
            200: {
              description: 'Room availability checked successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              isAvailable: { type: 'boolean', description: 'Whether the requested quantity is available' },
                              availAbality: { type: 'integer', description: 'Total available rooms for the date' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Bad request - Missing required parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Room not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/bookings/room': {
        post: {
          summary: 'Book a hotel room',
          tags: ['Bookings'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['roomId', 'bookingDate', 'quantity'],
                  properties: {
                    roomId: { type: 'integer', description: 'ID of the room to book' },
                    bookingDate: { type: 'string', format: 'date', description: 'Date of booking (YYYY-MM-DD)' },
                    quantity: { type: 'integer', minimum: 1, description: 'Number of rooms to book' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Room booked successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Booking' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Room not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/bookings': {
        get: {
          summary: 'Get user bookings with pagination',
          tags: ['Bookings'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of bookings per page',
            },
          ],
          responses: {
            200: {
              description: 'Bookings fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: {
                                      allOf: [
                                        { $ref: '#/components/schemas/Booking' },
                                        {
                                          properties: {
                                            room: { type: 'object' },
                                            restaurant: { type: 'object' },
                                            user: { type: 'object' },
                                          },
                                        },
                                      ],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'No bookings found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/bookings/admin': {
        get: {
          summary: 'Get all bookings for admin with pagination',
          tags: ['Bookings'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of bookings per page',
            },
          ],
          responses: {
            200: {
              description: 'Bookings fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: {
                                      allOf: [
                                        { $ref: '#/components/schemas/Booking' },
                                        {
                                          properties: {
                                            room: { type: 'object' },
                                            restaurant: { type: 'object' },
                                            user: { type: 'object' },
                                          },
                                        },
                                      ],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'No bookings found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/bookings/status/{id}': {
        put: {
          summary: 'Update booking status',
          tags: ['Bookings'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Booking ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status', 'type'],
                  properties: {
                    status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], description: 'New booking status' },
                    type: { type: 'string', enum: ['room', 'restaurant'], description: 'Type of booking (room or restaurant)' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Booking status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      booking: { $ref: '#/components/schemas/Booking' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Bad request - Validation error or not enough availability',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Booking not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants': {
        get: {
          summary: 'Get all restaurants with pagination',
          tags: ['Restaurants'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of restaurants per page',
            },
          ],
          responses: {
            200: {
              description: 'Restaurants fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Restaurant' },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a new restaurant',
          tags: ['Restaurants'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'location', 'cuisine', 'seats'],
                  properties: {
                    name: { type: 'string', description: 'Restaurant name' },
                    location: { type: 'string', description: 'Restaurant location' },
                    cuisine: { type: 'string', description: 'Type of cuisine' },
                    seats: { type: 'integer', description: 'Number of seats available' },
                    menu: { type: 'array', items: { type: 'object' }, description: 'Restaurant menu items' },
                    image: { type: 'string', description: 'Restaurant image URL' },
                    description: { type: 'string', description: 'Restaurant description' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Restaurant created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Restaurant' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants/{id}': {
        get: {
          summary: 'Get detailed restaurant information including bookings',
          tags: ['Restaurants'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Restaurant ID',
            },
          ],
          responses: {
            200: {
              description: 'Restaurant details fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Restaurant' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Restaurant not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update an existing restaurant',
          tags: ['Restaurants'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Restaurant ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Restaurant name' },
                    location: { type: 'string', description: 'Restaurant location' },
                    cuisine: { type: 'string', description: 'Type of cuisine' },
                    seats: { type: 'integer', description: 'Number of seats available' },
                    menu: { type: 'string', description: 'Restaurant menu (JSON string)' },
                    timeSlots: { type: 'string', description: 'Available time slots (JSON string)' },
                    image: { type: 'string', format: 'binary', description: 'Restaurant image file' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Restaurant updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Restaurant' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Restaurant not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants/search/result': {
        get: {
          summary: 'Search restaurants by name, location, ratings, and cuisine',
          tags: ['Restaurants'],
          parameters: [
            {
              in: 'query',
              name: 'name',
              schema: { type: 'string' },
              description: 'Restaurant name (case-insensitive search)',
            },
            {
              in: 'query',
              name: 'location',
              schema: { type: 'string' },
              description: 'Restaurant location (case-insensitive search)',
            },
            {
              in: 'query',
              name: 'ratings',
              schema: { type: 'number' },
              description: 'Minimum rating',
            },
            {
              in: 'query',
              name: 'cuisine',
              schema: { type: 'string' },
              description: 'Type of cuisine',
            },
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of restaurants per page',
            },
          ],
          responses: {
            200: {
              description: 'Restaurants fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: '#/components/schemas/PaginationResponse' },
                              {
                                properties: {
                                  data: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Restaurant' },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Something went wrong',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants/reservation/check': {
        get: {
          summary: 'Check table availability for a restaurant',
          tags: ['Restaurants'],
          parameters: [
            {
              in: 'query',
              name: 'restaurantId',
              required: true,
              schema: { type: 'string' },
              description: 'Restaurant ID',
            },
            {
              in: 'query',
              name: 'date',
              required: true,
              schema: { type: 'string', format: 'date' },
              description: 'Date to check availability (YYYY-MM-DD)',
            },
            {
              in: 'query',
              name: 'partySize',
              schema: { type: 'string', default: '1' },
              description: 'Number of people in the party',
            },
            {
              in: 'query',
              name: 'timeSlot',
              required: true,
              schema: { type: 'string' },
              description: 'Time slot for the reservation',
            },
          ],
          responses: {
            200: {
              description: 'Table availability checked successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              isAvailable: { type: 'boolean', description: 'Whether the requested party size is available' },
                              availAbality: { type: 'integer', description: 'Total available seats for the date and time slot' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Restaurant not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants/reservation': {
        post: {
          summary: 'Reserve a table at a restaurant',
          tags: ['Restaurants'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['restaurantId', 'bookingDate', 'timeSlot'],
                  properties: {
                    restaurantId: { type: 'integer', description: 'ID of the restaurant' },
                    bookingDate: { type: 'string', format: 'date', description: 'Date of reservation (YYYY-MM-DD)' },
                    partySize: { type: 'integer', default: 1, description: 'Number of people in the party' },
                    timeSlot: { type: 'string', description: 'Time slot for the reservation' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Table reserved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Booking' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation error or not enough seats available',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Restaurant not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/restaurants/reservation/{id}': {
        post: {
          summary: 'Update restaurant booking status',
          tags: ['Restaurants'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Booking ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], description: 'New booking status' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Booking status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      booking: { $ref: '#/components/schemas/Booking' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error or not enough seats available',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Booking or restaurant not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // No need for file annotations since everything is centralized
};

const specs = swaggerJsdoc(swaggerOptions);

export default specs;