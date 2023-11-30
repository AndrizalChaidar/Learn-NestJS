import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const options = {
    queue: 'songs_queue',
    urls: [
      `amqp://${configService.get('RABBITMQ_USER')}:${configService.get(
        'RABBITMQ_PASSWORD',
      )}@${configService.get('RABBITMQ_HOST')}`,
    ],
    queueOptions: {
      durable: true,
    },
    prefetchCount: 1,
  };
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options,
    },
    { inheritAppConfig: true },
  );
  const logger = new Logger();
  const port = configService.get('PORT', 3000);
  await app.listen(port, () => logger.log(`Listening on PORT ${port}`));
  await app.startAllMicroservices();
}
bootstrap();
