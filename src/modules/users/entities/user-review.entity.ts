import { nanoid } from 'nanoid'
import {
	Check,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryColumn,
	Unique,
	UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'user_reviews' })
@Unique('uq_user_review_author_target', ['authorUserId', 'targetUserId'])
@Check('chk_user_review_rating_range', 'rating >= 1 AND rating <= 5')
export class UserReviewEntity {
	@PrimaryColumn()
	id: string = nanoid()

	@Index('idx_user_reviews_target_user_id')
	@Column({ name: 'target_user_id', type: 'varchar' })
	targetUserId!: string

	@Index('idx_user_reviews_author_user_id')
	@Column({ name: 'author_user_id', type: 'varchar' })
	authorUserId!: string

	@Column({ type: 'smallint' })
	rating!: number

	@Column({ type: 'varchar', nullable: true })
	comment?: string | null

	@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
	updatedAt!: Date
}
