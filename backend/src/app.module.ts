import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { SupabaseModule } from './supabase/supabase.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    // Load .env variables globally — available in all modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Firebase Admin SDK module (shared globally)
    FirebaseModule,

    // Supabase Storage module (shared globally)
    SupabaseModule,

    // Feature modules
    WorkersModule,
  ],
})
export class AppModule {}
