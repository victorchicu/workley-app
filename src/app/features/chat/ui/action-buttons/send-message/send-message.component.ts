import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CreateChatCommandResult} from '../../../../../shared/models/command.models';
import {ChatFacade} from '../../../chat.facade';

@Component({
  selector: 'app-send-message-button',
  standalone: true,
  imports: [
    FormsModule

  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.css'
})
export class SendMessageComponent {
  @Input() deactivated: boolean = false;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  readonly facade: ChatFacade = inject(ChatFacade);
  handleClick() {
    console.log("Handle send message click")
  }

  onSubmit() {
    // this.facade.sendMessage("", "").subscribe({
    //   next: (response: CreateChatCommandResult) => {
    //     console.log("Navigating to chat with id:", response.chatId)
    //     this.router.navigate(['/chat', response.chatId], {state: response})
    //       .then();
    //   },
    //   error: (cause) => {
    //     console.error("Chat creation failed:", cause);
    //     this.router.navigate(['/error'])
    //       .then();
    //   }
    // });
  }
}
