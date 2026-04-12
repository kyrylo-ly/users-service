import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { RpcStatus } from '@razom-pay/common'
import type {
	CreateUserRequest,
	GetMeRequest,
	PatchUserRequest
} from '@razom-pay/contracts/gen/users'
import { lastValueFrom } from 'rxjs'

import { AccountClientGrpc } from '../../infra/grpc/clients/account.client'

import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly accountClient: AccountClientGrpc
	) {}

	async getMe(data: GetMeRequest) {
		const { id } = data
		const profile = await this.usersRepository.findById(id)

		if (!profile)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		const account = await lastValueFrom(
			this.accountClient.getAccount({ id })
		)

		return {
			user: {
				id: profile.id,
				name: profile.name,
				avatar: profile.avatar,
				phone: account.phone,
				email: account.email
			}
		}
	}

	async create(data: CreateUserRequest) {
		await this.usersRepository.create({ id: data.id })

		return { ok: true }
	}

	async patchUser(data: PatchUserRequest) {
		const { userId, name } = data

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		await this.usersRepository.update(user.id, {
			...(name !== undefined && { name })
		})

		return { ok: true }
	}
}
