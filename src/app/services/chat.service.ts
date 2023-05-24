import { Injectable } from '@angular/core';
import { Observable} from 'rxjs'
import { io } from 'socket.io-client'
import { environment } from 'src/environments/environment.development';
import { MessageObject, Notification } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket:any;
  private userID!: number;

  public connect = () => {
    this.socket = io(environment.api);
  }

  constructor(){
    this.connect()
    this.socket.on('message',(message:any)=> {
      
      if(message.type === 0){
        this.userID = message.userID
      }
      
    })
  }

  public getNewMessages = () => {
      return new Observable((observer:any) => {
          this.socket.on('chat', (message:any) => {
            message.userID === this.userID? message.flag = 1 : message.false = 0;
            observer.next(message);
          });
      });
  }

  public onTyping=()=>{
    return new Observable((observer:any)=>{
      this.socket.on('typing',(notification:Notification)=>{
        if(notification.userID === this.userID){
          notification = new Notification
        }
        observer.next(notification);
      })
    })
  }

  public sendMessage(message: MessageObject) {
    message.userID = this.userID;
    this.socket.emit('chat', message);
  }

  public typing(typing: Notification){    
    typing.userID = this.userID;
    this.socket.emit('typing',typing);
  }

  public disconnect(){
    this.socket.disconnect()
  }

}
