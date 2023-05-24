import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from './services/chat.service';
import { environment } from 'src/environments/environment.development';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ChatService]
})
export class AppComponent {

  myName: string = "";
  myMessage: string = "";
  numberOfMessage : number = 0;
  limitReached : boolean = true;
  messageLimit : number = environment.messageLimit;
  messageList: MessageObject[] = [];
  closingText: string = environment.closingText;
  url: string = environment.contactMe;
  typingInterval:number = 5000; 
  typingTimer: any;
  typingList: Notification[] = [];
  isTyping:boolean = false;

  @ViewChild('chatWindowRef') chatWindowRef: ElementRef | any

  constructor(private chatService: ChatService) {
    this.chatService.getNewMessages().subscribe((newMessage: any) => (this.updateMessage(newMessage)));
    this.chatService.onTyping().subscribe((value: any) => (this.updateFeedback(value)));
    this.chatService.connect()
  }

  send() {
    if (!isTextEmpty(this.myMessage) && !isTextEmpty(this.myName) && !this.limitReached) {
      const message:MessageObject = new MessageObject();
      message.message = this.myMessage;
      message.name = this.myName
      this.chatService.sendMessage(message);
      message.flag = 1;
      this.myMessage = ""
      this.clearTimer()
      this.doneTyping()
      this.updateNumberOfMessage()
    }    
  }

  onInput() {
    
    if(this.isTyping){
      return
    }

    this.isTyping = true

    if (this.myName !== "" && !this.limitReached) {
      let notification: Notification = new Notification()
      notification.name = this.myName
      notification.isTyping = true
      this.chatService.typing(notification);
    } else {
      return
    }
  }

  startTimer() {
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(this.doneTyping,this.typingInterval)
  }

  clearTimer = () => {
    clearTimeout(this.typingTimer)
  }

  doneTyping = () => {    
    
    this.isTyping = false
    let notification: Notification = new Notification()
    notification.name = this.myName
    notification.isTyping = false
    this.chatService.typing(notification)
  }

  updateMessage(message: MessageObject) {    

    const user = this.messageList.find((item) => message.userID === item.userID)

    if(user){
      
      if(user.name !== message.name){
        this.messageList.forEach((item,index) => {
          if(item.userID === message.userID){
            this.messageList[index].name = message.name
          }
        })
      }
    }
    
    this.messageList.push(message);
    this.chatWindowRef.nativeElement.scrollTo({
      top: this.chatWindowRef.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
    
  }

  updateFeedback(notification: Notification) {

    if(notification.userID === undefined){
      return
    }
    
    if(notification.isTyping){
      this.typingList.push(notification)
    } else {
      this.typingList.forEach((item,index)=> {
        if(item.userID === notification.userID){
          this.typingList.splice(index,1)
        }
      })
    }

  }

  frMessage(messageObject: MessageObject): boolean {
    return messageObject.flag == 0 ? true : false
  }

  updateNumberOfMessage(){

    if(this.numberOfMessage >= this.messageLimit){

      this.limitReached = true;
      this.disconnect()

    } else {
      this.numberOfMessage + 1
    }

  }

  isFriendMessage(message: MessageObject): boolean{
    if(message.flag == 0){
      return true
    } else {
     return false
    }
  }

  isLastMessage(index: number): boolean {    
    return index == this.messageList.length - 1
  }

  disconnect(){
    this.chatService.disconnect()
  }

  goToLink() {
    window.open(this.url, "_blank");
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event:any) {
    this.disconnect()
  }

}

export class MessageObject {
  userID!: number;
  name:string = "";
  message:string = "";
  flag:number = 0
}

export class Notification {
  userID!: number;
  name: string = "";
  isTyping: boolean = false;
}

export const isTextEmpty = (string:string):boolean => {
  return string === null || string.trim() === ""
}
