import { Injectable } from '@angular/core';

export type AfterLoginActionType = () => void;

@Injectable()
export class LoginFormService {

  private afterLoginActions: AfterLoginActionType[] = [];

  public addAfterLoginActions(afterLoginAction: AfterLoginActionType): void {
    this.afterLoginActions.push(afterLoginAction);
  }

  public executeAfterLoginActions(): void {
    // setTimeout - wait for cookies will be installed
    this.afterLoginActions.forEach((action: AfterLoginActionType) => setTimeout(action));
    this.afterLoginActions = [];
  }
}
