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

	@GrpcMethod('UsersService', 'GetUserProfile')
	getUserProfile(data: { id: string }) {
		return this.usersService.getUserProfile(data)
	}

	@GrpcMethod('UsersService', 'SetUserRoles')
	setUserRoles(data: { userId: string; roles: string[] }) {
		return this.usersService.setUserRoles(data)
	}

	@GrpcMethod('UsersService', 'SubmitKycLight')
	submitKycLight(data: {
		userId: string
		fullName: string
		documentNumberLast4: string
		countryCode: string
	}) {
		return this.usersService.submitKycLight(data)
	}

	@GrpcMethod('UsersService', 'ReviewKycLight')
	reviewKycLight(data: { userId: string; approve: boolean; reason?: string }) {
		return this.usersService.reviewKycLight(data)
	}

	@GrpcMethod('UsersService', 'CreateUserReview')
	createUserReview(data: {
		authorUserId: string
		targetUserId: string
		rating: number
		comment?: string
	}) {
		return this.usersService.createUserReview(data)
	}

	@GrpcMethod('UsersService', 'ListUserReviews')
	listUserReviews(data: { userId: string; limit?: number; offset?: number }) {
		return this.usersService.listUserReviews(data)
	}
}
