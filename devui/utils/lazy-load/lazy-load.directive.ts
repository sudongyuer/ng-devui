import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Directive({ selector: '[dLazyLoad]' })
export class LazyLoadDirective implements OnDestroy, OnChanges {

  // 启用懒加载，默认不启用
  @Input() enableLazyLoad = false;
  // 滚动监听的目标，默认是宿主，
  @Input() target: ElementRef | Window;
  // 加载更多
  @Output() loadMore = new EventEmitter<any>();

  scrollSubscription: Subscription;

  // 触发懒加载的距离
  loadFactor = 5;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    const element = this.target ? this.target : this.el.nativeElement;
    if (changes && changes['enableLazyLoad']) {
      if (changes.enableLazyLoad.currentValue) {
        this.scrollSubscription = fromEvent(element, 'scroll').pipe(
          debounceTime(300),
          distinctUntilChanged()
        ).subscribe(event => this.scrollList(event));
      } else if (this.scrollSubscription) {
        this.scrollSubscription.unsubscribe();
      } else {
        return;
      }
    }
  }
  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  scrollList(event) {
    const targetEl = event.target.scrollingElement ? event.target.scrollingElement : event.target;
    const clientHeight = targetEl.clientHeight;
    const scrollHeight = targetEl.scrollHeight;
    const scrollTop = targetEl.scrollTop;
    if (scrollTop !== 0 && (scrollTop + clientHeight + this.loadFactor >= scrollHeight)) {
      this.loadMore.emit(event);
    }

  }
}
