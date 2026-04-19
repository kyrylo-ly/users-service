import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { RpcStatus } from '@razom-pay/common'
import type {
	CreateUserRequest,
	GetMeRequest,
	PatchUserRequest
} from '@razom-pay/contracts/gen/users'
import { PinoLogger } from 'nestjs-pino'
import { lastValueFrom } from 'rxjs'

import { AccountClientGrpc } from '../../infra/grpc/clients/account.client'

import {
	KycStatus,
	UserRole
} from './entities/user.entity'
import { UsersRepository } from './users.repository'

type CreateUserReviewRequest = {
	authorUserId: string
	targetUserId: string
	rating: number
	comment?: string
}

type ListUserReviewsRequest = {
	userId: string
	limit?: number
	offset?: number
}

type SetUserRolesRequest = {
	userId: string
	roles: string[]
}

type SubmitKycLightRequest = {
	userId: string
	fullName: string
	documentNumberLast4: string
	countryCode: string
}

type ReviewKycLightRequest = {
	userId: string
	approve: boolean
	reason?: string
}

@Injectable()
export class UsersService {
	constructor(
		private readonly logger: PinoLogger,
		private readonly usersRepository: UsersRepository,
		private readonly accountClient: AccountClientGrpc
	) {
		this.logger.setContext(UsersService.name)
	}

	async getMe(data: GetMeRequest) {
		const { id } = data
		this.logger.info(`GetMe requested: userId=${id}`)

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
				bio: profile.bio,
				city: profile.city,
				roles: profile.roles,
				ratingScore: Number(profile.ratingScore ?? 0),
				reviewsCount: profile.reviewsCount,
				kycStatus: profile.kycStatus,
				kycLevel: profile.kycLevel,
				phone: account.phone,
				email: account.email
			}
		}
	}

	async create(data: CreateUserRequest) {
		this.logger.info(`CreateUser requested: userId=${data.id}`)

		await this.usersRepository.create({ id: data.id })

		this.logger.info(`CreateUser completed: userId=${data.id}`)

		return { ok: true }
	}

	async patchUser(data: PatchUserRequest) {
		const { userId, name, avatar, bio, city } =
			data as PatchUserRequest & {
				avatar?: string
				bio?: string
				city?: string
			}
		this.logger.info(`PatchUser requested: userId=${userId}`)

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		await this.usersRepository.update(user.id, {
			...(name !== undefined && { name }),
			...(avatar !== undefined && { avatar }),
			...(bio !== undefined && { bio }),
			...(city !== undefined && { city })
		})

		this.logger.info(`PatchUser completed: userId=${userId}`)

		return { ok: true }
	}

	async setUserRoles(data: SetUserRolesRequest) {
		const { userId, roles } = data
		this.logger.info(`SetUserRoles requested: userId=${userId}`)

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		const normalizedRoles = (roles ?? [])
			.map((role) => role.toUpperCase())
			.filter((role): role is UserRole =>
				Object.values(UserRole).includes(role as UserRole)
			)

		await this.usersRepository.update(user.id, {
			roles: normalizedRoles.length > 0 ? normalizedRoles : [UserRole.MEMBER]
		})

		this.logger.info(`SetUserRoles completed: userId=${userId}`)

		return { ok: true }
	}

	async submitKycLight(data: SubmitKycLightRequest) {
		const { userId, fullName, documentNumberLast4, countryCode } = data
		this.logger.info(`SubmitKycLight requested: userId=${userId}`)

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		await this.usersRepository.update(user.id, {
			kycStatus: KycStatus.PENDING,
			kycLevel: 'LIGHT',
			kycSubmittedAt: new Date(),
			kycVerifiedAt: null,
			kycRejectionReason: null,
			kycLightPayload: {
				fullName,
				documentNumberLast4,
				countryCode
			}
		})

		this.logger.info(`SubmitKycLight completed: userId=${userId}`)

		return { ok: true }
	}

	async reviewKycLight(data: ReviewKycLightRequest) {
		const { userId, approve, reason } = data
		this.logger.info(`ReviewKycLight requested: userId=${userId}`)

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		await this.usersRepository.update(user.id, {
			kycStatus: approve ? KycStatus.VERIFIED : KycStatus.REJECTED,
			kycVerifiedAt: approve ? new Date() : null,
			kycRejectionReason: approve ? null : (reason ?? 'KYC verification failed')
		})

		this.logger.info(`ReviewKycLight completed: userId=${userId}`)

		return { ok: true }
	}

	async createUserReview(data: CreateUserReviewRequest) {
		const { authorUserId, targetUserId, rating, comment } = data
		this.logger.info(
			`CreateUserReview requested: authorUserId=${authorUserId}, targetUserId=${targetUserId}`
		)

		if (authorUserId === targetUserId)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				message: 'User cannot review themselves'
			})

		if (rating < 1 || rating > 5)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				message: 'Rating should be in range 1..5'
			})

		const [authorUser, targetUser] = await Promise.all([
			this.usersRepository.findById(authorUserId),
			this.usersRepository.findById(targetUserId)
		])

		if (!authorUser || !targetUser)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Author or target user not found'
			})

		const existing = await this.usersRepository.findReviewByAuthorAndTarget(
			authorUserId,
			targetUserId
		)

		if (existing) {
			await this.usersRepository.saveReview({
				...existing,
				rating,
				comment: comment ?? null
			})
		} else {
			await this.usersRepository.saveReview({
				authorUserId,
				targetUserId,
				rating,
				comment: comment ?? null
			})
		}

		const aggregate = await this.usersRepository.calculateRatingAggregate(
			targetUserId
		)

		await this.usersRepository.update(targetUserId, {
			ratingScore: aggregate.ratingScore,
			reviewsCount: aggregate.reviewsCount
		})

		this.logger.info(`CreateUserReview completed: targetUserId=${targetUserId}`)

		return { ok: true }
	}

	async listUserReviews(data: ListUserReviewsRequest) {
		const { userId, limit = 20, offset = 0 } = data
		this.logger.info(`ListUserReviews requested: userId=${userId}`)

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'User not found'
			})

		const normalizedLimit = Math.max(1, Math.min(100, limit))
		const normalizedOffset = Math.max(0, offset)

		const [reviews, total] = await Promise.all([
			this.usersRepository.listReviewsByUserId(
				userId,
				normalizedLimit,
				normalizedOffset
			),
			this.usersRepository.countReviewsByUserId(userId)
		])

		return {
			reviews: reviews.map((review) => ({
				id: review.id,
				authorUserId: review.authorUserId,
				targetUserId: review.targetUserId,
				rating: review.rating,
				comment: review.comment,
				createdAt: review.createdAt.toISOString()
			})),
			total
		}
	}

	async getUserProfile(data: { id: string }) {
		return this.getMe({ id: data.id })
	}
}
