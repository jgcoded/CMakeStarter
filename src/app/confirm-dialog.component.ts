import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'confirm-dialog',
  template: `
  <h2>Confirm</h2>
  <div md-dialog-content>Are you sure?</div>
  <button md-button (click)="dialogRef.close(true)">Yes</button>
  <button md-button (click)="dialogRef.close(false)">No</button>
`
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MdDialogRef<ConfirmDialogComponent>
  ) {}
}
