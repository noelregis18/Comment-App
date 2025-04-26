import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Bootstrap function to initialize and configure the NestJS application
 * This sets up middleware, validation, documentation, and starts the server
 */
async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend access
  // This allows the React frontend to make requests to this backend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  });
  
  // Global validation pipe to automatically validate incoming requests
  // - whitelist: Only keeps properties defined in DTOs
  // - transform: Automatically transform payloads to DTO instances
  // - forbidNonWhitelisted: Throws errors when non-whitelisted properties are sent
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Swagger API documentation setup
  // This provides interactive API documentation at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Comment App API')
    .setDescription('API for Comment Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start the server
  // Uses environment PORT variable or defaults to 3003
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

// Start the application
bootstrap();
