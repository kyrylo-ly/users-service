import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type {
	CreateUserRequest,
	GetMeRequest,
	PatchUserRequest
} from '@razom-pay/contracts/gen/users'

import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@GrpcMethod('UsersService', 'GetMe')
	getMe(data: GetMeRequest) {
		return this.usersService.getMe(data)
	}

	@GrpcMethod('UsersService', 'CreateUser')
	create(data: CreateUserRequest) {
		return this.usersService.create(data)
	}

	@GrpcMethod('UsersService', 'PatchUser')
	patch(data: PatchUserRequest) {
		return this.usersService.patchUser(data)
	}
}
