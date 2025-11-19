import { Module } from '@nestjs/common';
import { QuotesModule } from './quotes/quotes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './quotes/quotes.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'quotes.sqlite',
      entities: [Quote, User],
      synchronize: true,
      logging: false,
    }),
    QuotesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
