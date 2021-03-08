import { Component } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent {

  feedback: string = '';
  loading: boolean = false;
  currentCategory: string = 'question';
  feedbackCategories: string[] = [ 'question', 'idea', 'problem', 'praise' ];

  responseText: string = '';

  constructor(
  ) {}

  changeCategory(category: string): void {
    this.currentCategory = category;
  }

  sendFeedback(): void {
    this.loading = true;
  }

  handleFeedbackValue(event: string): void {
    this.feedback = event;
  }

}
