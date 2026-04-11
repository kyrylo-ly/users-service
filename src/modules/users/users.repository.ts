import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersRepository {
	constructor(
		@InjectRepository(UserEntity)
		private readonly repository: Repository<UserEntity>
	) {}

	findById(id: string) {
		return this.repository.findOne({ where: { id } })
	}

	create(data: Partial<UserEntity>) {
		const user = this.repository.create(data)
		return this.repository.save(user)
	}
}
