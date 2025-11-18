import { Module } from '@nestjs/common';
import { QuotesModule } from './quotes/quotes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './quotes/quotes.entity';

@Module({
  imports: [
    QuotesModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'quotes.sqlite',
      entities: [Quote],
      synchronize: true,
      logging: false,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
