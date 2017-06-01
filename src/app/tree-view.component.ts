import { Component, Input, Output, EventEmitter } from '@angular/core';

export type Tree = {
  id?: number,
  value: string,
  children: Array<Tree>;
};

@Component({
  selector: 'tree-view',
  template: `

<li>
<div [class.bold]="hasChildren()" (click)="nodeSelected()">
  <span *ngIf="hasChildren()" >
    <md-icon md-list-icon *ngIf="expanded">folder_open</md-icon>
    <md-icon md-list-icon *ngIf="!expanded">folder</md-icon>
  </span>
  <md-icon md-list-icon *ngIf="!hasChildren()">description</md-icon>
  {{tree.value.toString()}}
</div>

  <ul *ngIf="expanded">
    <tree-view class="node" *ngFor="let child of tree.children" [tree]="child" [onNodeSelected]="onNodeSelected"></tree-view>
  </ul>

</li>
`,
  styles: [`

.node {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
  `]
})
export class TreeViewComponent<T> {

  @Input() tree: Tree;
  @Input() onNodeSelected: EventEmitter<Tree>;

  expanded: boolean = true;

  hasChildren(): boolean {
    return this.tree.children && this.tree.children.length > 0;
  }

  nodeSelected(): void {
    if(this.hasChildren()) {
      this.expanded = !this.expanded;
    }

    if(this.onNodeSelected) {
      this.onNodeSelected.emit(this.tree);
    }
  }

}