import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { createGrpcServer } from './infra/grpc/grpc.server'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(ConfigService)

	createGrpcServer(app, configService)

	app.startAllMicroservices()

	app.init()
}
bootstrap()

// TODO: feat: prometheus metrics scrapping
