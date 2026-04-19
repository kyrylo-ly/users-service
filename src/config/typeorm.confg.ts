import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { UserReviewEntity } from '../modules/users/entities/user-review.entity'
import { UserEntity } from '../modules/users/entities/user.entity'

export const getTypeOrmConfig = (
	configService: ConfigService
): TypeOrmModuleOptions => {
	return {
		type: 'postgres',
		host: configService.getOrThrow<string>('DB_HOST'),
		port: configService.getOrThrow<number>('DB_PORT'),
		username: configService.getOrThrow<string>('DB_USERNAME'),
		password: configService.getOrThrow<string>('DB_PASSWORD'),
		database: configService.getOrThrow<string>('DB_NAME'),
		entities: [UserEntity, UserReviewEntity],
		synchronize: configService.getOrThrow<string>('DB_SYNC') === 'true',
		logging: configService.getOrThrow<string>('DB_LOGGING') === 'true'
	}
}
