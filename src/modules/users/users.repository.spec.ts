import { Test, TestingModule } from '@nestjs/testing'
import { UsersRepository } from './users.repository'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { Repository } from 'typeorm'

describe('UsersRepository', () => {
	let repository: UsersRepository
	let typeOrmRepository: jest.Mocked<Repository<UserEntity>>

	beforeEach(async () => {
		const mockTypeOrmRepository = {
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			update: jest.fn()
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersRepository,
				{
					provide: getRepositoryToken(UserEntity),
					useValue: mockTypeOrmRepository
				}
			]
		}).compile()

		repository = module.get<UsersRepository>(UsersRepository)
		typeOrmRepository = module.get(getRepositoryToken(UserEntity))
	})

	it('should be defined', () => {
		expect(repository).toBeDefined()
	})

	describe('findById', () => {
		it('should call findOne with correct params', async () => {
			const mockUser = { id: '1', name: 'Test' }
			typeOrmRepository.findOne.mockResolvedValue(mockUser as any)

			const result = await repository.findById('1')

			expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
				where: { id: '1' }
			})
			expect(result).toEqual(mockUser)
		})
	})

	describe('create', () => {
		it('should create and save a new user', async () => {
			const data = { id: '1', name: 'Test' }
			const mockSavedUser = { ...data, createdAt: new Date() }
			
			typeOrmRepository.create.mockReturnValue(data as any)
			typeOrmRepository.save.mockResolvedValue(mockSavedUser as any)

			const result = await repository.create(data)

			expect(typeOrmRepository.create).toHaveBeenCalledWith(data)
			expect(typeOrmRepository.save).toHaveBeenCalledWith(data)
			expect(result).toEqual(mockSavedUser)
		})
	})

	describe('update', () => {
		it('should update and return the updated user', async () => {
			const id = '1'
			const data = { name: 'Updated' }
			const mockUpdatedUser = { id, name: 'Updated' }

			typeOrmRepository.update.mockResolvedValue({} as any)
			typeOrmRepository.findOne.mockResolvedValue(mockUpdatedUser as any)

			const result = await repository.update(id, data)

			expect(typeOrmRepository.update).toHaveBeenCalledWith({ id }, data)
			expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
				where: { id }
			})
			expect(result).toEqual(mockUpdatedUser)
		})
	})
})
