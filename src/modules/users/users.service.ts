import { Injectable } from '@nestjs/common'
import type { CreateUserRequest } from '@razom-pay/contracts/gen/users'

import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async create(data: CreateUserRequest) {
		await this.usersRepository.create({ id: data.id })

		return { ok: true }
	}
}
