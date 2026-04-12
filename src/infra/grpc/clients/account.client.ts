import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import type {
	AccountServiceClient,
	GetAccountRequest
} from '@razom-pay/contracts/gen/account'

@Injectable()
export class AccountClientGrpc implements OnModuleInit {
	private accountService!: AccountServiceClient

	constructor(
		@Inject('ACCOUNT_PACKAGE') private readonly client: ClientGrpc
	) {}

	onModuleInit() {
		this.accountService =
			this.client.getService<AccountServiceClient>('AccountService')
	}

	getAccount(request: GetAccountRequest) {
		return this.accountService.getAccount(request)
	}
}
