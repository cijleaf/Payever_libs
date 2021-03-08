import { OnInit } from '@angular/core';
import { SearchGroup } from '@pe/ng-kit/modules/search-results';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchBoxService } from '../../../shared-dashboard/services';

export abstract class SearchBoxAbstractComponent implements OnInit {
  hasValue: boolean;
  groups: SearchGroup[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected searchBoxService: SearchBoxService
  ) {
  }

  ngOnInit(): void {
    this.searchBoxService.reset();
  }

  protected abstract onSearch(value: string): void;
}


