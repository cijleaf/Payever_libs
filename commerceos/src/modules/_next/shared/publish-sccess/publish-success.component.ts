import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'pe-publish-success',
  templateUrl: './publish-success.component.html',
  styleUrls: ['./publish-success.component.scss']
})
export class PePublishSuccessComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PePublishSuccessComponent>,

  ) {
  }

  ngOnInit() {
  }

}
