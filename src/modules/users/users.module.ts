import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PROTO_PATHS } from '@razom-pay/contracts'

import { AccountClientGrpc } from '../../infra/grpc/clients/account.client'

import { UserReviewEntity } from './entities/user-review.entity'
import { UserEntity } from './entities/user.entity'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, UserReviewEntity]),
		ClientsModule.registerAsync([
			{
				name: 'ACCOUNT_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'account.v1',
						protoPath: PROTO_PATHS.ACCOUNT,
						url: configService.getOrThrow<string>('AUTH_GRPC_URL', {
							infer: true
						})
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	controllers: [UsersController],
	providers: [UsersService, UsersRepository, AccountClientGrpc]
})
export class UsersModule {}
