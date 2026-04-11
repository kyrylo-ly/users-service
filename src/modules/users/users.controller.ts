import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type { CreateUserRequest } from '@razom-pay/contracts/gen/users'

import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@GrpcMethod('UsersService', 'CreateUser')
	create(data: CreateUserRequest) {
		return this.usersService.create(data)
	}
}
