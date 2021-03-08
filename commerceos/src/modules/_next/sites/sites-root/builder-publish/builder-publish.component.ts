import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PebEditorApi } from "@pe/builder-api";
import { catchError, switchMap, takeUntil, tap } from "rxjs/operators";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { PebShopContainer, PebTheme } from "@pe/builder-core";
import { BehaviorSubject, EMPTY, Subject } from "rxjs";
import { HttpEventType } from "@angular/common/http";
import { TranslateService } from '@pe/ng-kit/src/kit/i18n';
@Component({
  selector: 'pe-builder-publish',
  templateUrl: './builder-publish.component.html',
  styleUrls: ['./builder-publish.component.scss']
})
export class PeSiteBuilderPublishComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<boolean>();
  loading = true;
  errorMsg = "";
  publishing: boolean;
  theme;
  preview;
  activeVersion;
  tags: string[] = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('fileInput') fileInput: ElementRef;
  isLargeThenParent = false;
  readonly isPictureLoadingSubject = new BehaviorSubject(true);
  uploadProgress = 0;

  constructor(
    public dialogRef: MatDialogRef<PeSiteBuilderPublishComponent>,
    private editorApi: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    if (this.data.theme) {
      this.getSnapshot(this.data.theme)
      return
    }
    this.editorApi.getShopActiveTheme(this.data.site).subscribe(data => this.getSnapshot(data.theme),
      err => {
        this.errorMsg = this.translateService.translate(`header.unknown_publish_error`);
        this.loading = false;
      }
    )
  }

  getSnapshot(theme) {
    this.editorApi.getShopThemeById(theme).pipe(
      switchMap((theme: PebTheme) => {
        this.theme = theme;
        if (!theme.picture) this.isPictureLoadingSubject.next(false);
        return this.editorApi.getThemeDetail(theme.id,'front');

      }),
      switchMap(data => {
        return this.editorApi.getPage(theme, data.pages[0].id, 'desktop');
      }),
      tap((data) => {
        this.preview = data;
      }),
      switchMap(data => {
        return this.editorApi.getShopThemeActiveVersion(theme);
      }),
      tap((data: any) => {
        this.activeVersion = data?.id;
        this.tags = data?.tags.length ? data.tags : [];
        this.loading = false;
      }),
      catchError(err =>{
        this.errorMsg=this.translateService.translate(`header.unknown_publish_error`);
        this.loading = false;
        return this.errorMsg;
      })

    ).subscribe()
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  updateThemeName(event) {
    this.editorApi.updateShopThemeName(this.theme.id, event).subscribe((data) => this.theme = data.theme)
  }

  publish() {
    this.publishing = true;
    this.editorApi.createShopThemeVersion(this.theme.id).pipe(
      switchMap(data => {
        return this.editorApi.publishShopThemeVersion(this.theme.id, data.id)

      }),
      catchError((err: any) => {
        this.publishing = false
        alert(this.translateService.translate(`header.no_publish`));
        return EMPTY
      })
    ).subscribe(() => this.dialogRef.close(true));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
    this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe()
  }

  remove(index): void {
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe()
    }
  }

  onImageUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.isPictureLoadingSubject.next(true);
        this.editorApi.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroyed$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.uploadProgress = event.loaded;
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.uploadProgress = 0;
                this.updateThemeImage(event?.body?.blobName)
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          })
        ).subscribe(
          () => { },
          (err) => {
            this.isPictureLoadingSubject.next(false)
            alert(this.translateService.translate(`header.no_update_image`))
          }
        );
      };
    }
  }

  updateThemeImage(image) {
    this.editorApi.updateShopThemePreview(this.theme.id, image).subscribe((data) => {
      this.theme = data;
      this.cdr.markForCheck();
      this.isPictureLoadingSubject.next(false)
    },
      (err) => {
        this.isPictureLoadingSubject.next(false)
        alert(this.translateService.translate(`header.no_update_image`))
      }
    )
  }

  onload() {
    this.isPictureLoadingSubject.next(false)
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
