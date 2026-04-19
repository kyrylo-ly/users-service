import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserReviewEntity } from './entities/user-review.entity'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersRepository {
	constructor(
		@InjectRepository(UserEntity)
		private readonly repository: Repository<UserEntity>,
		@InjectRepository(UserReviewEntity)
		private readonly reviewRepository: Repository<UserReviewEntity>
	) {}

	findById(id: string) {
		return this.repository.findOne({ where: { id } })
	}

	create(data: Partial<UserEntity>) {
		const user = this.repository.create(data)
		return this.repository.save(user)
	}

	async update(id: string, data: Partial<UserEntity>) {
		const existing = await this.findById(id)

		if (!existing) return null

		this.repository.merge(existing, data)
		await this.repository.save(existing)

		return this.findById(id)
	}

	findReviewByAuthorAndTarget(authorUserId: string, targetUserId: string) {
		return this.reviewRepository.findOne({
			where: { authorUserId, targetUserId }
		})
	}

	async saveReview(data: Partial<UserReviewEntity>) {
		const review = this.reviewRepository.create(data)

		return this.reviewRepository.save(review)
	}

	listReviewsByUserId(userId: string, limit: number, offset: number) {
		return this.reviewRepository.find({
			where: { targetUserId: userId },
			order: { createdAt: 'DESC' },
			take: limit,
			skip: offset
		})
	}

	countReviewsByUserId(userId: string) {
		return this.reviewRepository.count({
			where: { targetUserId: userId }
		})
	}

	async calculateRatingAggregate(userId: string) {
		const aggregate = await this.reviewRepository
			.createQueryBuilder('review')
			.select('COALESCE(AVG(review.rating), 0)', 'avg')
			.addSelect('COUNT(review.id)', 'count')
			.where('review.target_user_id = :userId', { userId })
			.getRawOne<{ avg: string; count: string }>()

		const ratingScore = Number.parseFloat(aggregate?.avg ?? '0')
		const reviewsCount = Number.parseInt(aggregate?.count ?? '0', 10)

		return { ratingScore, reviewsCount }
	}
}
