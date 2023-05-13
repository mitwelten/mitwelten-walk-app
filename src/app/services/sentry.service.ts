import { ErrorHandler, Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class SentryService extends ErrorHandler {

  constructor(private dataService: DataService) {
    super();
  }

  override handleError(error: any) {
    if (error) {
      this.dataService.postError(error);
      super.handleError(error);
    }
  }
}
