import { nanoid } from 'nanoid'
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn
} from 'typeorm'

export enum UserRole {
	MEMBER = 'MEMBER',
	ORGANIZER = 'ORGANIZER',
	SUPPLIER = 'SUPPLIER',
	MODERATOR = 'MODERATOR'
}

export enum KycStatus {
	UNVERIFIED = 'UNVERIFIED',
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED'
}

@Entity({ name: 'users' })
export class UserEntity {
	@PrimaryColumn()
	id: string = nanoid()

	@Column({ type: 'varchar', nullable: true })
	name?: string | null

	@Column({ type: 'varchar', nullable: true })
	avatar?: string | null

	@Column({ type: 'varchar', nullable: true })
	bio?: string | null

	@Column({ type: 'varchar', nullable: true })
	city?: string | null

	@Column({
		type: 'enum',
		enum: UserRole,
		array: true,
		default: [UserRole.MEMBER]
	})
	roles!: UserRole[]

	@Column({ name: 'rating_score', type: 'numeric', precision: 4, scale: 2, default: 0 })
	ratingScore!: number

	@Column({ name: 'reviews_count', type: 'int', default: 0 })
	reviewsCount!: number

	@Column({
		name: 'kyc_status',
		type: 'enum',
		enum: KycStatus,
		default: KycStatus.UNVERIFIED
	})
	kycStatus!: KycStatus

	@Column({ name: 'kyc_level', type: 'varchar', default: 'NONE' })
	kycLevel!: string

	@Column({ name: 'kyc_submitted_at', type: 'timestamptz', nullable: true })
	kycSubmittedAt?: Date | null

	@Column({ name: 'kyc_verified_at', type: 'timestamptz', nullable: true })
	kycVerifiedAt?: Date | null

	@Column({ name: 'kyc_rejection_reason', type: 'varchar', nullable: true })
	kycRejectionReason?: string | null

	@Column({ name: 'kyc_light_payload', type: 'jsonb', nullable: true })
	kycLightPayload?: Record<string, unknown> | null

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updatedAt!: Date
}
