import { Directive, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';

@Directive({
    // tslint:disable-next-line directive-selector
    selector: '[fixIEMouseWheel]'
})
export class FixIEMouseWheelDirective implements OnInit, OnDestroy {

    private currentNode: any;

    private preventScroll: boolean = false;

    private get isPositionFixed(): boolean {
        if (!this.currentNode) {
            return false;
        }
        const calcStyle = getComputedStyle(this.currentNode);
        return calcStyle.position === 'fixed';
    }

    constructor(
        private el: ElementRef
    ) {
        this.onMouseWheel = this.onMouseWheel.bind(this);
    }

    ngOnInit() {
        this.currentNode = this.el.nativeElement;
        if (!this.currentNode) {
            console.warn('FixIEMouseWheelDirective node not found', this);
        }

        this.preventScroll = this.isPositionFixed;
        this.currentNode.addEventListener('wheel', this.onMouseWheel, {
            capture: true,
            passive: false
        });
    }

    ngOnDestroy() {
        if (this.currentNode) {
            this.currentNode.removeEventListener('wheel', this.onMouseWheel);
        }
    }

    @HostListener('window:resize')
    public onResize() {
        this.preventScroll = this.isPositionFixed;
    }

    public onMouseWheel(event: Event) {
        if (!event.cancelable || !this.preventScroll) {
            return;
        }
        event.preventDefault();
    }

}
