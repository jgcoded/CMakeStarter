import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import * as CodeMirror from 'codemirror';

@Component({
  selector: 'code-mirror',
  template: `
  <textarea #code></textarea>
`,
})
export class CodeMirrorComponent implements OnInit, AfterViewInit {

  @ViewChild('code') codeTextArea: ElementRef;

  @Input() code: string;
  @Input() setCode: EventEmitter<string>;
  @Input() changeMode: EventEmitter<string>;
  @Input() configuration: CodeMirror.EditorConfiguration;

  @Output() codeChange = new EventEmitter<string>();

  codemirror: CodeMirror.EditorFromTextArea;

  ngOnInit() {
    if(this.setCode) {
      this.setCode.subscribe((newCode: string) => {
        if(this.codemirror) {
          this.codemirror.setValue(newCode);
          this.codeChange.emit(this.codemirror.getValue());
        }
      });
    }
    if(this.changeMode) {
      this.changeMode.subscribe((newMode: any) => {
        if(this.codemirror) {
          this.codemirror.setOption('mode', newMode);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.codemirror = CodeMirror.fromTextArea(this.codeTextArea.nativeElement, this.configuration);
    this.codemirror.on('change', editor => {
      this.codeChange.emit(editor.getValue());
    });
  }

}