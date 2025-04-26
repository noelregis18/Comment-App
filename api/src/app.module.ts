import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExternalModule } from './external/external.module';

/**
 * Main application module that configures the entire NestJS application
 * This includes database connection, feature modules, and global config
 */
@Module({
  imports: [
    // Configuration module for environment variables
    // isGlobal: true makes the config available throughout the application
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Database connection configuration
    // Using SQLite in-memory database for development/testing purposes
    // In production, this would typically be replaced with a persistent database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    // Feature modules
    UsersModule,         // User management functionality
    CommentsModule,      // Comment CRUD operations with nested replies
    AuthModule,          // Authentication and authorization
    NotificationsModule, // User notifications for comment replies
    ExternalModule,      // External API integrations (YouTube, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
