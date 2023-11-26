import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: 'SONG_SERVICE',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              transport: Transport.RMQ,
              options: {
                queue: 'songs_queue',
                urls: [
                  `amqp://${configService.get(
                    'RABBITMQ_USER',
                  )}:${configService.get(
                    'RABBITMQ_PASSWORD',
                  )}@${configService.get('RABBITMQ_HOST')}`,
                ],
                queueOptions: {
                  durable: true,
                },
                prefetchCount: 1,
              },
            };
          },
        },
      ],
    }),
  ],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
