import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import { DatabaseModule } from './infra/db/db.module'
import { UsersModule } from './modules/users/users.module'
import { ObservabilityModule } from './observability/observability.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL,
				transport: {
					target: 'pino/file',
					options: {
						destination: '/var/log/services/users/users.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({
					service: 'users-service'
				})
			}
		}),
		ObservabilityModule,
		DatabaseModule,
		UsersModule
	]
})
export class AppModule {}
