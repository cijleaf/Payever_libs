import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MessageBus} from '@pe/builder-core';
import { AbstractComponent } from '@pe/builder-editor';
import { OPTIONS } from '@pe/sites-app';


@Component({
  selector: 'pe-builder-view',
  templateUrl: './builder-view.component.html',
  styleUrls: ['./builder-view.component.scss']
})
export class PebSiteBuilderViewComponent extends AbstractComponent {
  options=OPTIONS;
  

  constructor(
    public dialogRef: MatDialogRef<PebSiteBuilderViewComponent>,
    private messageBus: MessageBus,
  ) {
    super();
  }

  ngOnInit() {
    
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(value){
    this.messageBus.emit('site.set.builder_view',value)
  }
  
}
